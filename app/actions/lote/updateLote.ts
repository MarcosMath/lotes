"use server";

import { updateLoteSchema } from "@/app/schemas/lote";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UpdateLoteResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function updateLote(
  formData: FormData
): Promise<UpdateLoteResult> {
  try {
    const loteId = parseInt(formData.get("id") as string);

    // verificar que el id es un numero valido
    if (!loteId || isNaN(loteId)) {
      return {
        success: false,
        message: "ID de lote inválido",
        errors: { id: ["Id de lote requerido"] },
      };
    }

    // buscar el lote por id con su urbanización
    const loteExistente = await prisma.lote.findUnique({
      where: { id: loteId },
      include: {
        urbanizacion: true,
      },
    });

    // si no existe, retornar error
    if (!loteExistente) {
      return {
        success: false,
        message: "Lote no encontrado",
        errors: { id: ["Lote especificado no existe"] },
      };
    }

    // Convertir FormData a objeto para validación
    const rawData: any = {};

    const manzano = formData.get("manzano") as string;
    if (manzano) {
      rawData.manzano = manzano;
    }

    const numero = formData.get("numero") as string;
    if (numero) {
      rawData.numero = parseFloat(numero);
    }

    const zona = formData.get("zona") as string;
    if (zona) {
      rawData.zona = zona;
    }

    const superficieM2 = formData.get("superficieM2") as string;
    if (superficieM2) {
      rawData.superficieM2 = parseFloat(superficieM2);
    }

    const precioM2 = formData.get("precioM2") as string;
    if (precioM2) {
      rawData.precioM2 = parseFloat(precioM2);
    }

    const estado = formData.get("estado") as string;
    if (estado) {
      rawData.estado = estado;
    }

    const formaVenta = formData.get("formaVenta") as string;
    if (formaVenta) {
      rawData.formaVenta = formaVenta;
    }

    const urbanizacionId = formData.get("urbanizacionId") as string;
    if (urbanizacionId) {
      rawData.urbanizacionId = parseInt(urbanizacionId);
    }

    // Validar los datos usando el esquema de Zod
    const validationResult = updateLoteSchema.safeParse(rawData);

    // si la validacion falla, retornar errores
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};

      validationResult.error.issues.forEach((err) => {
        if (!errors[err.path[0] as string]) {
          errors[err.path[0] as string] = [];
        }
        errors[err.path[0] as string].push(err.message);
      });

      return {
        success: false,
        message: "Error de validación en los datos del Lote",
        errors,
      };
    }

    // Si la validación es exitosa, obtener los datos validados
    const validatedData = validationResult.data;

    // Verificar que la urbanización existe si se está actualizando
    if (validatedData.urbanizacionId) {
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
    }

    const updateData: any = {};

    if (validatedData.manzano !== undefined)
      updateData.manzano = validatedData.manzano;
    if (validatedData.numero !== undefined)
      updateData.numero = validatedData.numero;
    if (validatedData.zona !== undefined) updateData.zona = validatedData.zona;
    if (validatedData.superficieM2 !== undefined)
      updateData.superficieM2 = validatedData.superficieM2;
    if (validatedData.precioM2 !== undefined)
      updateData.precioM2 = validatedData.precioM2;
    if (validatedData.estado !== undefined)
      updateData.estado = validatedData.estado;
    if (validatedData.formaVenta !== undefined)
      updateData.formaVenta = validatedData.formaVenta;
    if (validatedData.urbanizacionId !== undefined)
      updateData.urbanizacionId = validatedData.urbanizacionId;

    // Recalcular campos calculados si se actualizaron los campos relacionados
    const manzanoFinal = validatedData.manzano ?? loteExistente.manzano;
    const numeroFinal = validatedData.numero ?? loteExistente.numero;
    const urbanizacionIdFinal = validatedData.urbanizacionId ?? loteExistente.urbanizacionId;
    const superficieFinal =
      validatedData.superficieM2 ?? loteExistente.superficieM2;
    const precioM2Final = validatedData.precioM2 ?? loteExistente.precioM2;

    // Verificar que no exista otro lote con la misma combinación en la urbanización
    if (
      validatedData.manzano !== undefined ||
      validatedData.numero !== undefined ||
      validatedData.urbanizacionId !== undefined
    ) {
      const loteConflicto = await prisma.lote.findFirst({
        where: {
          manzano: manzanoFinal,
          numero: numeroFinal,
          urbanizacionId: urbanizacionIdFinal,
          NOT: {
            id: loteId, // Excluir el lote actual
          },
        },
      });

      if (loteConflicto) {
        const urbanizacionNombre = validatedData.urbanizacionId
          ? urbanizacionExiste?.nombre
          : loteExistente.urbanizacion?.nombre;

        return {
          success: false,
          message: `Ya existe el lote ${manzanoFinal}-${numeroFinal} en la urbanización "${urbanizacionNombre}"`,
          errors: {
            manzano: ["Esta combinación de manzano y número ya existe"],
            numero: ["Esta combinación de manzano y número ya existe"],
          },
        };
      }
    }

    // Recalcular nombre si cambió manzano o número
    if (validatedData.manzano !== undefined || validatedData.numero !== undefined) {
      updateData.nombre = `${manzanoFinal}-${numeroFinal}`;
    }

    // Recalcular precioContado si cambió superficie o precioM2
    if (
      validatedData.superficieM2 !== undefined ||
      validatedData.precioM2 !== undefined
    ) {
      updateData.precioContado = superficieFinal * precioM2Final;
    }

    // Actualizar el lote en la base de datos
    const updatedLote = await prisma.lote.update({
      where: { id: loteId },
      data: updateData,
      include: {
        urbanizacion: true,
      },
    });

    // Revalidar la ruta de los lotes para reflejar los cambios
    revalidatePath("/dashboard/lotes");
    revalidatePath(`/dashboard/lotes/${loteId}`);
    revalidatePath(`/dashboard/lotes/${loteId}/update`);
    revalidatePath(`/dashboard/urbanizaciones/${updatedLote.urbanizacionId}`);

    return {
      success: true,
      message: "Lote actualizado con éxito",
      data: updatedLote,
    };
  } catch (error) {
    console.error("Error al actualizar el lote:", error);

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
    }

    // Manejar errores inesperados
    return {
      success: false,
      message: "Error al actualizar el lote",
      errors: { general: ["Error interno del servidor"] },
    };
  }
}
