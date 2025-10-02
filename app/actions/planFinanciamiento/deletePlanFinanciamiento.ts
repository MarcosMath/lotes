"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeletePlanFinanciamientoResult = {
  success: boolean;
  message: string;
};

export async function deletePlanFinanciamiento(
  id: number
): Promise<DeletePlanFinanciamientoResult> {
  try {
    // Verificar que el plan existe
    const planExistente = await prisma.planFinanciamiento.findUnique({
      where: { id },
      include: {
        financiamientos: true,
      },
    });

    if (!planExistente) {
      return {
        success: false,
        message: "El plan de financiamiento no existe",
      };
    }

    // Verificar si hay financiamientos asociados
    if (planExistente.financiamientos.length > 0) {
      return {
        success: false,
        message: `No se puede eliminar el plan "${planExistente.nombre}" porque tiene ${planExistente.financiamientos.length} financiamiento(s) asociado(s)`,
      };
    }

    // Eliminar el plan
    await prisma.planFinanciamiento.delete({
      where: { id },
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/planes-financiamiento");

    return {
      success: true,
      message: `Plan de financiamiento "${planExistente.nombre}" eliminado exitosamente`,
    };
  } catch (error) {
    console.error("Error al eliminar plan de financiamiento:", error);

    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          message:
            "No se puede eliminar el plan porque tiene financiamientos asociados",
        };
      }
    }

    return {
      success: false,
      message: "Error interno del servidor. Inténtelo de nuevo.",
    };
  }
}
