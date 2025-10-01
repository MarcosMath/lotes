"use server";

import { updateUrbanizacionSchema } from "@/app/schemas/urbanizacion";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UpdateUrbanizacionResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function updateUrbanizacion(
  formData: FormData
): Promise<UpdateUrbanizacionResult> {
  try {
    const urbanizacionId = parseInt(formData.get("id") as string);

    // verificar que el id es un numero valido
    if (!urbanizacionId || isNaN(urbanizacionId)) {
      return {
        success: false,
        message: "ID de urbanización inválido",
        errors: { id: ["Id de urbanización  requerido"] },
      };
    }

    // buscar la urbanizacion por id
    const urbanizacionExistente = await prisma.urbanizacion.findUnique({
      where: { id: urbanizacionId },
    });

    // si no existe, retornar error
    if (!urbanizacionExistente) {
      return {
        success: false,
        message: "Urbanización no encontrada",
        errors: { id: ["Urbanización especificada no existe"] },
      };
    }

    // Converitimos Formdata a objeto para validacion
    const rawData: any = {};

    if (urbanizacionId) {
      rawData.id = urbanizacionId;
    }

    const nombre = formData.get("nombre") as string;
    if (nombre) {
      rawData.nombre = nombre;
    }

    const ubicacion = formData.get("ubicacion") as string;
    if (ubicacion) {
      rawData.ubicacion = ubicacion;
    }
    // Validar los datos usando el esquema de Zod
    const validationResult = updateUrbanizacionSchema.safeParse(rawData);

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
        message: "Error de validación en los datos de la Urbanización",
        errors,
      };
    }

    // Si la validación es exitosa, obtener los datos validados
    const validatedData = validationResult.data;

    const updateData: any = {};

    if (validatedData.nombre !== undefined)
      updateData.nombre = validatedData.nombre;
    if (validatedData.ubicacion !== undefined)
      updateData.ubicacion = validatedData.ubicacion;

    // Actualizar la urbanización en la base de datos
    const updatedUrbanizacion = await prisma.urbanizacion.update({
      where: { id: urbanizacionId },
      data: updateData,
    });

    // Revalidar la ruta de las urbanizaciones para reflejar los cambios
    revalidatePath("/dashboard/urbanizaciones");
    revalidatePath(`/dashboard/urbanizaciones/${urbanizacionId}`);
    revalidatePath(`/dashboard/urbanizaciones/${urbanizacionId}/update`);

    return {
      success: true,
      message: "Urbanización actualizada con éxito",
      data: updatedUrbanizacion,
    };
  } catch (error) {
    console.error("Error al actualizar la urbanización:", error);

    // Manejar errores inesperados
    return {
      success: false,
      message: "Error al actualizar la urbanización",
      errors: { general: ["Error interno del servidor"] },
    };
  }
}
