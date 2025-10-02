"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  updatePlanFinanciamientoSchema,
  type UpdatePlanFinanciamientoInput,
} from "@/app/schemas/planFinanciamiento";

type UpdatePlanFinanciamientoResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function updatePlanFinanciamiento(
  id: number,
  formData: FormData
): Promise<UpdatePlanFinanciamientoResult> {
  try {
    // Verificar que el plan existe
    const planExistente = await prisma.planFinanciamiento.findUnique({
      where: { id },
    });

    if (!planExistente) {
      return {
        success: false,
        message: "El plan de financiamiento no existe",
      };
    }

    // Datos obtenidos del Formulario
    const rawData: any = {};

    if (formData.get("nombre")) rawData.nombre = formData.get("nombre") as string;
    if (formData.get("porcentajeAnual"))
      rawData.porcentajeAnual = parseFloat(formData.get("porcentajeAnual") as string);
    if (formData.get("cantidadCuotas"))
      rawData.cantidadCuotas = parseInt(formData.get("cantidadCuotas") as string);
    if (formData.get("tipoCuotaInicial"))
      rawData.tipoCuotaInicial = formData.get("tipoCuotaInicial") as string;
    if (formData.get("valorCuotaInicial"))
      rawData.valorCuotaInicial = parseFloat(formData.get("valorCuotaInicial") as string);
    if (formData.get("activo") !== null)
      rawData.activo = formData.get("activo") === "true";

    // Validación de los datos del Formulario contra el Esquema
    const validationResult = updatePlanFinanciamientoSchema.safeParse(rawData);

    // Tratamiento si la validación de datos falla
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });
      return {
        success: false,
        message: "Error de validación en los datos del plan de financiamiento",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (validatedData.nombre && validatedData.nombre !== planExistente.nombre) {
      const nombreEnUso = await prisma.planFinanciamiento.findUnique({
        where: { nombre: validatedData.nombre },
      });

      if (nombreEnUso) {
        return {
          success: false,
          message: `Ya existe un plan de financiamiento con el nombre "${validatedData.nombre}"`,
          errors: {
            nombre: ["Este nombre ya está en uso"],
          },
        };
      }
    }

    // Actualizar el Plan de Financiamiento
    const planActualizado = await prisma.planFinanciamiento.update({
      where: { id },
      data: validatedData,
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/planes-financiamiento");
    revalidatePath(`/dashboard/planes-financiamiento/${id}`);

    return {
      success: true,
      message: `Plan de financiamiento "${planActualizado.nombre}" actualizado exitosamente`,
      data: planActualizado,
    };
  } catch (error) {
    console.error("Error al actualizar plan de financiamiento:", error);

    if (error instanceof Error) {
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
