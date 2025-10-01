"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createLoteSchema,
  type CreateLoteInput,
} from "@/app/schemas/lote";

type CreateLoteResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function createLote(
  formData: FormData
): Promise<CreateLoteResult> {
  try {
    // Datos obtenidos del Formulario
    const rawData = {
      manzano: formData.get("manzano") as string,
      numero: parseFloat(formData.get("numero") as string),
      zona: formData.get("zona") as string,
      superficieM2: parseFloat(formData.get("superficieM2") as string),
      precioM2: parseFloat(formData.get("precioM2") as string),
      estado: formData.get("estado") as string,
      formaVenta: formData.get("formaVenta") as string,
      urbanizacionId: parseInt(formData.get("urbanizacionId") as string),
    };

    // Validación de los datos del Formulario contra el Esquema
    const validationResult = createLoteSchema.safeParse(rawData);

    // Tratamiento si la validación de datos falla
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      // captura de los errores en el registro errors
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });
      // Retorno de los errores en el proceso de validación
      return {
        success: false,
        message: "Error de validación en los datos del lote",
        errors,
      };
    }

    // Obtención de los datos válidos resultado de la validación
    const validatedData = validationResult.data;

    // Verificar que la urbanización existe
    const urbanizacionExiste = await prisma.urbanizacion.findUnique({
      where: { id: validatedData.urbanizacionId },
    });

    if (!urbanizacionExiste) {
      return {
        success: false,
        message: "La urbanización seleccionada no existe",
        errors: { urbanizacionId: ["Urbanización no válida"] },
      };
    }

    // Verificar que no exista un lote con el mismo manzano y número en esta urbanización
    const loteExistente = await prisma.lote.findFirst({
      where: {
        manzano: validatedData.manzano,
        numero: validatedData.numero,
        urbanizacionId: validatedData.urbanizacionId,
      },
    });

    if (loteExistente) {
      return {
        success: false,
        message: `Ya existe el lote ${validatedData.manzano}-${validatedData.numero} en la urbanización "${urbanizacionExiste.nombre}"`,
        errors: {
          manzano: ["Esta combinación de manzano y número ya existe"],
          numero: ["Esta combinación de manzano y número ya existe"],
        },
      };
    }

    // Calcular campos calculados
    const nombre = `${validatedData.manzano}-${validatedData.numero}`;
    const precioContado = validatedData.superficieM2 * validatedData.precioM2;

    // Crear el Lote con los datos válidos y campos calculados
    const nuevoLote = await prisma.lote.create({
      data: {
        manzano: validatedData.manzano,
        numero: validatedData.numero,
        nombre: nombre,
        zona: validatedData.zona,
        superficieM2: validatedData.superficieM2,
        precioM2: validatedData.precioM2,
        precioContado: precioContado,
        estado: validatedData.estado,
        formaVenta: validatedData.formaVenta || null,
        urbanizacionId: validatedData.urbanizacionId,
      },
      include: {
        urbanizacion: true,
      },
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/lotes");
    revalidatePath(`/dashboard/urbanizaciones/${validatedData.urbanizacionId}`);

    // retornar éxito en la validación adjuntando el lote creado
    return {
      success: true,
      message: `Lote "${nuevoLote.nombre}" creado exitosamente`,
      data: nuevoLote,
    };
  } catch (error) {
    console.error("Error al crear lote:", error);

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      // Error P2002 es de constraint único
      if (error.message.includes("Unique constraint") || error.message.includes("unique_lote_por_urbanizacion")) {
        return {
          success: false,
          message: "Ya existe un lote con la misma combinación de manzano y número en esta urbanización",
          errors: {
            manzano: ["Esta combinación ya existe"],
            numero: ["Esta combinación ya existe"],
          },
        };
      }

      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          message: "La urbanización seleccionada no es válida",
          errors: { urbanizacionId: ["Urbanización no válida"] },
        };
      }
    }

    return {
      success: false,
      message: "Error interno del servidor. Inténtelo de nuevo.",
    };
  }
}
