"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createFinanciamientoLoteSchema,
  type CreateFinanciamientoLoteInput,
} from "@/app/schemas/financiamientoLote";

type CreateFinanciamientoLoteResult = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export async function createFinanciamientoLote(
  formData: FormData
): Promise<CreateFinanciamientoLoteResult> {
  try {
    // Datos obtenidos del Formulario
    const rawData = {
      loteId: parseInt(formData.get("loteId") as string),
      planFinanciamientoId: parseInt(
        formData.get("planFinanciamientoId") as string
      ),
    };

    // Validación de los datos del Formulario contra el Esquema
    const validationResult = createFinanciamientoLoteSchema.safeParse(rawData);

    // Tratamiento si la validación de datos falla
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });
      return {
        success: false,
        message: "Error de validación en los datos del financiamiento",
        errors,
      };
    }

    const validatedData = validationResult.data;

    // Verificar que el lote existe
    const lote = await prisma.lote.findUnique({
      where: { id: validatedData.loteId },
    });

    if (!lote) {
      return {
        success: false,
        message: "El lote seleccionado no existe",
        errors: { loteId: ["Lote no válido"] },
      };
    }

    // Verificar que el plan de financiamiento existe y está activo
    const plan = await prisma.planFinanciamiento.findUnique({
      where: { id: validatedData.planFinanciamientoId },
    });

    if (!plan) {
      return {
        success: false,
        message: "El plan de financiamiento seleccionado no existe",
        errors: { planFinanciamientoId: ["Plan de financiamiento no válido"] },
      };
    }

    if (!plan.activo) {
      return {
        success: false,
        message: `El plan "${plan.nombre}" no está activo`,
        errors: { planFinanciamientoId: ["Plan de financiamiento no activo"] },
      };
    }

    // Verificar que no exista ya un financiamiento con este lote y plan
    const financiamientoExistente = await prisma.financiamientoLote.findUnique({
      where: {
        unique_financiamiento_lote_plan: {
          loteId: validatedData.loteId,
          planFinanciamientoId: validatedData.planFinanciamientoId,
        },
      },
    });

    if (financiamientoExistente) {
      return {
        success: false,
        message: `Ya existe un financiamiento del lote "${lote.nombre}" con el plan "${plan.nombre}"`,
        errors: {
          planFinanciamientoId: ["Esta combinación ya existe"],
        },
      };
    }

    // Calcular valores del financiamiento
    let cuotaInicial: number;

    if (plan.tipoCuotaInicial === "PORCENTAJE") {
      cuotaInicial = lote.precioContado * (plan.valorCuotaInicial / 100);
    } else {
      // MONTO_FIJO
      cuotaInicial = plan.valorCuotaInicial;
    }

    // Validar que la cuota inicial no sea mayor al precio de contado
    if (cuotaInicial > lote.precioContado) {
      return {
        success: false,
        message: `La cuota inicial ($${cuotaInicial.toFixed(2)}) no puede ser mayor al precio de contado del lote ($${lote.precioContado.toFixed(2)})`,
        errors: {
          planFinanciamientoId: ["Cuota inicial mayor al precio de contado"],
        },
      };
    }

    const saldoFinanciar = lote.precioContado - cuotaInicial;
    const interesTotal = saldoFinanciar * (plan.porcentajeAnual / 100);
    const cuotaMensual = (saldoFinanciar + interesTotal) / plan.cantidadCuotas;
    const precioTotalCredito = cuotaMensual * plan.cantidadCuotas + cuotaInicial;

    // Crear el Financiamiento de Lote
    const nuevoFinanciamiento = await prisma.financiamientoLote.create({
      data: {
        loteId: validatedData.loteId,
        planFinanciamientoId: validatedData.planFinanciamientoId,
        cuotaInicial,
        saldoFinanciar,
        interesTotal,
        cuotaMensual,
        precioTotalCredito,
      },
      include: {
        lote: true,
        planFinanciamiento: true,
      },
    });

    // Revalidar las Páginas Relacionadas
    revalidatePath("/dashboard/lotes");
    revalidatePath(`/dashboard/lotes/${validatedData.loteId}`);
    revalidatePath("/dashboard/planes-financiamiento");

    return {
      success: true,
      message: `Financiamiento creado exitosamente para el lote "${lote.nombre}" con el plan "${plan.nombre}"`,
      data: nuevoFinanciamiento,
    };
  } catch (error) {
    console.error("Error al crear financiamiento de lote:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("unique_financiamiento_lote_plan")
      ) {
        return {
          success: false,
          message: "Ya existe un financiamiento con esta combinación de lote y plan",
          errors: {
            planFinanciamientoId: ["Esta combinación ya existe"],
          },
        };
      }

      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          message: "El lote o plan de financiamiento seleccionado no es válido",
        };
      }
    }

    return {
      success: false,
      message: "Error interno del servidor. Inténtelo de nuevo.",
    };
  }
}
