"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteUrbanizacionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function deleteUrbanizacion(
  formData: FormData
): Promise<DeleteUrbanizacionResult> {
  try {
    const urbanizacionId = parseInt(formData.get("id") as string);

    // verificar que el id es un numero valido
    if (!urbanizacionId || isNaN(urbanizacionId)) {
      return {
        success: false,
        message: "ID de urbanización inválido",
        errors: { id: ["Id de urbanización requerido"] },
      };
    }

    // buscar la urbanizacion por id con sus lotes
    const urbanizacionExistente = await prisma.urbanizacion.findUnique({
      where: { id: urbanizacionId },
      include: {
        lotes: true,
      },
    });

    // si no existe, retornar error
    if (!urbanizacionExistente) {
      return {
        success: false,
        message: "Urbanización no encontrada",
        errors: { id: ["Urbanización especificada no existe"] },
      };
    }

    // Validar que no tenga lotes asociados
    if (urbanizacionExistente.lotes.length > 0) {
      return {
        success: false,
        message: `No se puede eliminar la urbanización "${urbanizacionExistente.nombre}" porque tiene ${urbanizacionExistente.lotes.length} lote(s) asociado(s)`,
        errors: {
          lotes: [
            `Elimine primero los ${urbanizacionExistente.lotes.length} lote(s) asociados`,
          ],
        },
      };
    }

    // Eliminar la urbanización
    await prisma.urbanizacion.delete({
      where: { id: urbanizacionId },
    });

    // Revalidar la ruta de las urbanizaciones
    revalidatePath("/dashboard/urbanizaciones");

    return {
      success: true,
      message: `Urbanización "${urbanizacionExistente.nombre}" eliminada con éxito`,
    };
  } catch (error) {
    console.error("Error al eliminar la urbanización:", error);

    // Manejar errores inesperados
    return {
      success: false,
      message: "Error al eliminar la urbanización",
      errors: { general: ["Error interno del servidor"] },
    };
  }
}
