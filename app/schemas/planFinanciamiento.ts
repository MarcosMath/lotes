import { z } from "zod";

// Esquema de datos para la validación en la creación de PlanFinanciamiento
export const createPlanFinanciamientoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe exceder de 100 caracteres"),
  porcentajeAnual: z
    .number({
      invalid_type_error: "El porcentaje anual debe ser un valor numérico",
    })
    .min(0, "El porcentaje anual no puede ser negativo")
    .max(100, "El porcentaje anual no puede ser mayor a 100%"),
  cantidadCuotas: z
    .number({
      invalid_type_error: "La cantidad de cuotas debe ser un valor numérico",
    })
    .int("La cantidad de cuotas debe ser un entero")
    .positive("La cantidad de cuotas debe ser mayor a 0"),
  tipoCuotaInicial: z.enum(["PORCENTAJE", "MONTO_FIJO"], {
    required_error: "Debe seleccionar un tipo de cuota inicial",
  }),
  valorCuotaInicial: z
    .number({
      invalid_type_error: "El valor de cuota inicial debe ser un valor numérico",
    })
    .min(0, "El valor de cuota inicial no puede ser negativo"),
  activo: z.boolean().default(true),
}).refine(
  (data) => {
    // Si es PORCENTAJE, el valor debe estar entre 0 y 100
    if (data.tipoCuotaInicial === "PORCENTAJE") {
      return data.valorCuotaInicial >= 0 && data.valorCuotaInicial <= 100;
    }
    return true;
  },
  {
    message: "El porcentaje de cuota inicial debe estar entre 0 y 100",
    path: ["valorCuotaInicial"],
  }
);

// Tipo de datos para la creación de PlanFinanciamiento
export type CreatePlanFinanciamientoInput = z.infer<
  typeof createPlanFinanciamientoSchema
>;

// Esquema de datos para la validación en la actualización de PlanFinanciamiento
export const updatePlanFinanciamientoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe exceder de 100 caracteres")
    .optional(),
  porcentajeAnual: z
    .number({
      invalid_type_error: "El porcentaje anual debe ser un valor numérico",
    })
    .min(0, "El porcentaje anual no puede ser negativo")
    .max(100, "El porcentaje anual no puede ser mayor a 100%")
    .optional(),
  cantidadCuotas: z
    .number({
      invalid_type_error: "La cantidad de cuotas debe ser un valor numérico",
    })
    .int("La cantidad de cuotas debe ser un entero")
    .positive("La cantidad de cuotas debe ser mayor a 0")
    .optional(),
  tipoCuotaInicial: z.enum(["PORCENTAJE", "MONTO_FIJO"]).optional(),
  valorCuotaInicial: z
    .number({
      invalid_type_error: "El valor de cuota inicial debe ser un valor numérico",
    })
    .min(0, "El valor de cuota inicial no puede ser negativo")
    .optional(),
  activo: z.boolean().optional(),
}).refine(
  (data) => {
    // Si se especifica tipo PORCENTAJE y valor, validar rango
    if (data.tipoCuotaInicial === "PORCENTAJE" && data.valorCuotaInicial !== undefined) {
      return data.valorCuotaInicial >= 0 && data.valorCuotaInicial <= 100;
    }
    return true;
  },
  {
    message: "El porcentaje de cuota inicial debe estar entre 0 y 100",
    path: ["valorCuotaInicial"],
  }
);

// Tipo de datos para la actualización de PlanFinanciamiento
export type UpdatePlanFinanciamientoInput = z.infer<
  typeof updatePlanFinanciamientoSchema
>;

// Tipo para el Formulario de creación
export type CreatePlanFinanciamientoFormData = {
  nombre: string;
  porcentajeAnual: number;
  cantidadCuotas: number;
  tipoCuotaInicial: "PORCENTAJE" | "MONTO_FIJO";
  valorCuotaInicial: number;
  activo: boolean;
};

// Tipo para el Formulario de actualización
export type UpdatePlanFinanciamientoFormData = {
  nombre?: string;
  porcentajeAnual?: number;
  cantidadCuotas?: number;
  tipoCuotaInicial?: "PORCENTAJE" | "MONTO_FIJO";
  valorCuotaInicial?: number;
  activo?: boolean;
};
