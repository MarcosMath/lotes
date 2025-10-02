"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema
import { createFinanciamientoLote } from "@/app/actions/financiamientoLote/createFinanciamientoLote";
import {
  createFinanciamientoLoteSchema,
  CreateFinanciamientoLoteFormData,
} from "@/app/schemas/financiamientoLote";

//importar componentes IU
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CreateFinanciamientoLoteFormProps {
  lotes: Array<{
    id: number;
    nombre: string;
    precioContado: number;
  }>;
  planesFinanciamiento: Array<{
    id: number;
    nombre: string;
    porcentajeAnual: number;
    cantidadCuotas: number;
    tipoCuotaInicial: "PORCENTAJE" | "MONTO_FIJO";
    valorCuotaInicial: number;
    activo: boolean;
  }>;
  preselectedLoteId?: number;
}

export default function CreateFinanciamientoLoteForm({
  lotes,
  planesFinanciamiento,
  preselectedLoteId,
}: CreateFinanciamientoLoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    cuotaInicial: number;
    saldoFinanciar: number;
    interesTotal: number;
    cuotaMensual: number;
    precioTotalCredito: number;
  } | null>(null);
  const router = useRouter();

  // Configurar el formulario con react-hook-form
  const form = useForm<CreateFinanciamientoLoteFormData>({
    resolver: zodResolver(createFinanciamientoLoteSchema),
    defaultValues: {
      loteId: preselectedLoteId || 0,
      planFinanciamientoId: 0,
    },
  });

  // Obtener el lote preseleccionado
  const selectedLote = preselectedLoteId
    ? lotes.find((l) => l.id === preselectedLoteId)
    : null;

  // Observar cambios en lote y plan para calcular preview
  const loteId = form.watch("loteId");
  const planId = form.watch("planFinanciamientoId");

  useEffect(() => {
    if (loteId && planId) {
      const lote = lotes.find((l) => l.id === loteId);
      const plan = planesFinanciamiento.find((p) => p.id === planId);

      if (lote && plan) {
        // Calcular preview
        let cuotaInicial: number;

        if (plan.tipoCuotaInicial === "PORCENTAJE") {
          cuotaInicial = lote.precioContado * (plan.valorCuotaInicial / 100);
        } else {
          cuotaInicial = plan.valorCuotaInicial;
        }

        const saldoFinanciar = lote.precioContado - cuotaInicial;
        const interesTotal = saldoFinanciar * (plan.porcentajeAnual / 100);
        const cuotaMensual = (saldoFinanciar + interesTotal) / plan.cantidadCuotas;
        const precioTotalCredito = cuotaMensual * plan.cantidadCuotas + cuotaInicial;

        setPreviewData({
          cuotaInicial,
          saldoFinanciar,
          interesTotal,
          cuotaMensual,
          precioTotalCredito,
        });
      }
    } else {
      setPreviewData(null);
    }
  }, [loteId, planId, lotes, planesFinanciamiento]);

  // Manejar el envio del formulario
  const onSubmit = async (values: CreateFinanciamientoLoteFormData) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("loteId", values.loteId.toString());
      formData.append("planFinanciamientoId", values.planFinanciamientoId.toString());

      //Llamar a la acción del servidor
      const result = await createFinanciamientoLote(formData);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        // Si vino desde un lote específico, regresar a ese lote
        if (preselectedLoteId) {
          router.push(`/dashboard/lotes/${preselectedLoteId}`);
        } else {
          router.push("/dashboard/lotes");
        }
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CreateFinanciamientoLoteFormData, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al crear el Financiamiento :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const planesActivos = planesFinanciamiento.filter((p) => p.activo);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Asignar Plan de Financiamiento a Lote</CardTitle>
        <CardDescription>
          {preselectedLoteId
            ? "Seleccione el plan de financiamiento. Los cálculos se mostrarán automáticamente."
            : "Seleccione el lote y el plan de financiamiento. Los cálculos se mostrarán automáticamente."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del Lote Preseleccionado */}
            {preselectedLoteId && selectedLote ? (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Lote Seleccionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Lote:</span>
                      <span className="font-bold">{selectedLote.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Precio de Contado:</span>
                      <span className="font-bold text-primary">
                        Bs. {selectedLote.precioContado.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Campo Lote - Solo se muestra si NO viene preseleccionado */
              <FormField
                control={form.control}
                name="loteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un lote" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lotes.map((lote) => (
                          <SelectItem key={lote.id} value={lote.id.toString()}>
                            {lote.nombre} - Bs. {lote.precioContado.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Seleccione el lote a financiar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Campo Plan de Financiamiento */}
            <FormField
              control={form.control}
              name="planFinanciamientoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de Financiamiento</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planesActivos.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No hay planes activos
                        </div>
                      ) : (
                        planesActivos.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.nombre} ({plan.cantidadCuotas} cuotas - {plan.porcentajeAnual}% anual)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Seleccione el plan de financiamiento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview de cálculos */}
            {previewData && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Preview de Financiamiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Cuota Inicial:</span>
                    <span className="font-bold">${previewData.cuotaInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saldo a Financiar:</span>
                    <span>${previewData.saldoFinanciar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Interés Total:</span>
                    <span>${previewData.interesTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Cuota Mensual:</span>
                    <span className="font-bold text-lg">${previewData.cuotaMensual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-lg">Precio Total a Crédito:</span>
                    <span className="font-bold text-lg text-primary">
                      ${previewData.precioTotalCredito.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={isLoading}
                onClick={() => {
                  if (preselectedLoteId) {
                    router.push(`/dashboard/lotes/${preselectedLoteId}`);
                  } else {
                    router.push("/dashboard/lotes");
                  }
                }}
              >
                Cancelar
              </Button>
              <Button type={"submit"} disabled={isLoading || planesActivos.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Financiamiento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
