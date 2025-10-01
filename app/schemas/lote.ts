import { z } from "zod";

// Esquema de datos para la validación en la creación de Lote
export const createLoteSchema = z.object({
  manzano: z
    .string()
    .min(1, "El manzano es requerido")
    .max(50, "El manzano no debe exceder de 50 caracteres"),
  numero: z
    .number({ invalid_type_error: "El número debe ser un valor numérico" })
    .int("El número debe ser un entero")
    .positive("El número debe ser positivo"),
  zona: z
    .string()
    .min(1, "La zona es requerida")
    .max(100, "La zona no debe exceder de 100 caracteres"),
  superficieM2: z
    .number({
      invalid_type_error: "La superficie debe ser un valor numérico",
    })
    .positive("La superficie debe ser mayor a 0"),
  precioM2: z
    .number({ invalid_type_error: "El precio debe ser un valor numérico" })
    .positive("El precio debe ser mayor a 0"),
  estado: z.enum(["DISPONIBLE", "ENPAGO", "PAGADO"]).default("DISPONIBLE"),
  formaVenta: z.enum(["CONTADO", "CREDITO"]).optional(),
  urbanizacionId: z
    .number({ invalid_type_error: "La urbanización es requerida" })
    .int("ID de urbanización inválido")
    .positive("ID de urbanización inválido"),
});

// Tipo de datos para la creación de Lote
export type CreateLoteInput = z.infer<typeof createLoteSchema>;

// Esquema de datos para la validación en la actualización de Lote
export const updateLoteSchema = z.object({
  manzano: z
    .string()
    .min(1, "El manzano es requerido")
    .max(50, "El manzano no debe exceder de 50 caracteres")
    .optional(),
  numero: z
    .number({ invalid_type_error: "El número debe ser un valor numérico" })
    .int("El número debe ser un entero")
    .positive("El número debe ser positivo")
    .optional(),
  zona: z
    .string()
    .min(1, "La zona es requerida")
    .max(100, "La zona no debe exceder de 100 caracteres")
    .optional(),
  superficieM2: z
    .number({
      invalid_type_error: "La superficie debe ser un valor numérico",
    })
    .positive("La superficie debe ser mayor a 0")
    .optional(),
  precioM2: z
    .number({ invalid_type_error: "El precio debe ser un valor numérico" })
    .positive("El precio debe ser mayor a 0")
    .optional(),
  estado: z.enum(["DISPONIBLE", "ENPAGO", "PAGADO"]).optional(),
  formaVenta: z.enum(["CONTADO", "CREDITO"]).optional(),
  urbanizacionId: z
    .number({ invalid_type_error: "La urbanización es requerida" })
    .int("ID de urbanización inválido")
    .positive("ID de urbanización inválido")
    .optional(),
});

// Tipo de datos para la actualización de Lote
export type UpdateLoteInput = z.infer<typeof updateLoteSchema>;

// Tipo para el Formulario de creación
export type CreateLoteFormData = {
  manzano: string;
  numero: number;
  zona: string;
  superficieM2: number;
  precioM2: number;
  estado: "DISPONIBLE" | "ENPAGO" | "PAGADO";
  formaVenta?: "CONTADO" | "CREDITO";
  urbanizacionId: number;
};

// Tipo para el Formulario de actualización
export type UpdateLoteFormData = {
  manzano?: string;
  numero?: number;
  zona?: string;
  superficieM2?: number;
  precioM2?: number;
  estado?: "DISPONIBLE" | "ENPAGO" | "PAGADO";
  formaVenta?: "CONTADO" | "CREDITO";
  urbanizacionId?: number;
};
