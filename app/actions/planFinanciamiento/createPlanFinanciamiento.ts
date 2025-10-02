"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createPlanFinanciamientoSchema,
  type CreatePlanFinanciamientoInput,
} from "@/app/schemas/planFinanciamiento";

type CreatePlanFinanciamientoResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function createPlanFinanciamiento(
  formData: FormData
): Promise<CreatePlanFinanciamientoResult> {
  try {
    // Datos obtenidos del Formulario
    const rawData = {
      nombre: formData.get("nombre") as string,
      porcentajeAnual: parseFloat(formData.get("porcentajeAnual") as string),
      cantidadCuotas: parseInt(formData.get("cantidadCuotas") as string),
      tipoCuotaInicial: formData.get("tipoCuotaInicial") as string,
      valorCuotaInicial: parseFloat(formData.get("valorCuotaInicial") as string),
      activo: formData.get("activo") === "true",
    };

    // Validación de los datos del Formulario contra el Esquema
    const validationResult = createPlanFinanciamientoSchema.safeParse(rawData);

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
        message: "Error de validación en los datos del plan de financiamiento",
        errors,
      };
    }

    // Obtención de los datos válidos resultado de la validación
    const validatedData = validationResult.data;

    // Verificar que no exista un plan con el mismo nombre
    const planExistente = await prisma.planFinanciamiento.findUnique({
      where: { nombre: validatedData.nombre },
    });

    if (planExistente) {
      return {
        success: false,
        message: `Ya existe un plan de financiamiento con el nombre "${validatedData.nombre}"`,
        errors: {
          nombre: ["Este nombre ya está en uso"],
        },
      };
    }

    // Crear el Plan de Financiamiento con los datos válidos
    const nuevoPlan = await prisma.planFinanciamiento.create({
      data: {
        nombre: validatedData.nombre,
        porcentajeAnual: validatedData.porcentajeAnual,
        cantidadCuotas: validatedData.cantidadCuotas,
        tipoCuotaInicial: validatedData.tipoCuotaInicial,
        valorCuotaInicial: validatedData.valorCuotaInicial,
        activo: validatedData.activo,
      },
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/planes-financiamiento");

    // retornar éxito en la validación adjuntando el plan creado
    return {
      success: true,
      message: `Plan de financiamiento "${nuevoPlan.nombre}" creado exitosamente`,
      data: nuevoPlan,
    };
  } catch (error) {
    console.error("Error al crear plan de financiamiento:", error);

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      // Error P2002 es de constraint único
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("nombre")
      ) {
        return {
          success: false,
          message: "Ya existe un plan de financiamiento con ese nombre",
          errors: {
            nombre: ["Este nombre ya existe"],
          },
        };
      }
    }

    return {
      success: false,
      message: "Error interno del servidor. Inténtelo de nuevo.",
    };
  }
}
