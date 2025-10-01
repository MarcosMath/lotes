"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteLoteResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function deleteLote(
  formData: FormData
): Promise<DeleteLoteResult> {
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

    // buscar el lote por id
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

    // Eliminar el lote
    await prisma.lote.delete({
      where: { id: loteId },
    });

    // Revalidar las rutas
    revalidatePath("/dashboard/lotes");
    revalidatePath(`/dashboard/urbanizaciones/${loteExistente.urbanizacionId}`);

    return {
      success: true,
      message: `Lote "${loteExistente.nombre}" eliminado con éxito`,
    };
  } catch (error) {
    console.error("Error al eliminar el lote:", error);

    // Manejar errores inesperados
    return {
      success: false,
      message: "Error al eliminar el lote",
      errors: { general: ["Error interno del servidor"] },
    };
  }
}
