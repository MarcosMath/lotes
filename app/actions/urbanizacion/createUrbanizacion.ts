"user server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createUrbanizacionSchema,
  type CreateUrbanizacionInput,
} from "@/app/schemas/urbanizacion";
import { UsbIcon } from "lucide-react";
import { any } from "zod";

type CreateUrbanizacionResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function createUrbanizacion(
  formData: FormData
): Promise<CreateUrbanizacionResult> {
  try {
    // Datos obtendios del Formulario
    const rawData = {
      nombre: formData.get("nombre") as string,
      ubicacion: formData.get("ubicacion") as string,
    };

    // Validación de los datos del Formulario contra el Esquema
    // de creación de la urbanización
    const validationResult = createUrbanizacionSchema.safeParse(rawData);

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

    // Obtención de los datos validos resultado de la valizacion
    // en el esquema
    const validateData = validationResult.data;

    // Crear la Urbanizacion con los datos validos
    const nuevaUrbanizacion = await prisma.urbanizacion.create({
      data: { nombre: validateData.nombre, ubicacion: validateData.ubicacion },
    });

    // Revalidar las Paginas Relacionadas
    revalidatePath("/dashboard/urbanizaciones");

    // retornar exito en la validación adjuntando la urbanizacion creada
    return {
      success: true,
      message: `Urbanización "${nuevaUrbanizacion.nombre}" creada exitosamente`,
      data: nuevaUrbanizacion,
    };
  } catch (error) {
    console.error("Error al crear lote:", error);

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          message: "Ya existe un lote con ese nombre",
          errors: { nombre: ["Este nombre ya está en uso"] },
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
