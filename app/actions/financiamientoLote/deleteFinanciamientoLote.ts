"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteFinanciamientoLoteResult = {
  success: boolean;
  message: string;
};

export async function deleteFinanciamientoLote(
  id: number
): Promise<DeleteFinanciamientoLoteResult> {
  try {
    // Verificar que el financiamiento existe
    const financiamientoExistente = await prisma.financiamientoLote.findUnique({
      where: { id },
      include: {
        lote: true,
        planFinanciamiento: true,
      },
    });

    if (!financiamientoExistente) {
      return {
        success: false,
        message: "El financiamiento no existe",
      };
    }

    // Eliminar el financiamiento
    await prisma.financiamientoLote.delete({
      where: { id },
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/lotes");
    revalidatePath(`/dashboard/lotes/${financiamientoExistente.loteId}`);
    revalidatePath("/dashboard/planes-financiamiento");

    return {
      success: true,
      message: `Financiamiento del lote "${financiamientoExistente.lote.nombre}" con plan "${financiamientoExistente.planFinanciamiento.nombre}" eliminado exitosamente`,
    };
  } catch (error) {
    console.error("Error al eliminar financiamiento de lote:", error);

    return {
      success: false,
      message: "Error interno del servidor. Inténtelo de nuevo.",
    };
  }
}
