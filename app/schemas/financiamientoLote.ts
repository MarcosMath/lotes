import { z } from "zod";

// Esquema de datos para la validación en la creación de FinanciamientoLote
export const createFinanciamientoLoteSchema = z.object({
  loteId: z
    .number({ invalid_type_error: "El lote es requerido" })
    .int("ID de lote inválido")
    .positive("ID de lote inválido"),
  planFinanciamientoId: z
    .number({ invalid_type_error: "El plan de financiamiento es requerido" })
    .int("ID de plan de financiamiento inválido")
    .positive("ID de plan de financiamiento inválido"),
});

// Tipo de datos para la creación de FinanciamientoLote
export type CreateFinanciamientoLoteInput = z.infer<
  typeof createFinanciamientoLoteSchema
>;

// Tipo para el Formulario de creación
export type CreateFinanciamientoLoteFormData = {
  loteId: number;
  planFinanciamientoId: number;
};
