import { z } from "zod";

// Esquema de datos para la validación en la creación de Urbanizacion
export const createUrbanizacionSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe de exceder de 100 caracteres"),
  ubicacion: z.string().optional(),
});

// Tipo de datos para la creacion de Urbanizacion
export type CreateUrbanizacionInput = z.infer<typeof createUrbanizacionSchema>;

// Esquema de datos para la validacion en la actualizacion de Urbanizacion
export const updateUrbanizacionSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe exceder de 100 caracteres")
    .optional(),
  ubicacion: z.string().optional(),
});

// Tipo de datos para la actualizacion de Urbanizacion
export type UpdateUrbanizacionInput = z.infer<typeof updateUrbanizacionSchema>;

// Esquema de validacion para la busqueda de urbanizacion por id.
export const getUrbanizacionByIdSchema = z.object({
  id: z.number().int().positive("El ID debe ser positivo"),
});

// Tipo de datos para la busqueda de Urbanizacion por id.
export type getUrbanizacionByIdInput = z.infer<
  typeof getUrbanizacionByIdSchema
>;

// Tipo para el Formulario
export type CreateUrbanizacionFormData = {
  nombre: string;
  ubicacion?: string;
};
