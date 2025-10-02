"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema para plan financiamiento
import { createPlanFinanciamiento } from "@/app/actions/planFinanciamiento/createPlanFinanciamiento";
import {
  createPlanFinanciamientoSchema,
  CreatePlanFinanciamientoFormData,
} from "@/app/schemas/planFinanciamiento";

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
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function CreatePlanFinanciamientoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Configurar el formulario con react-hook-form
  const form = useForm<CreatePlanFinanciamientoFormData>({
    resolver: zodResolver(createPlanFinanciamientoSchema),
    defaultValues: {
      nombre: "",
      porcentajeAnual: 0,
      cantidadCuotas: 12,
      tipoCuotaInicial: "PORCENTAJE",
      valorCuotaInicial: 0,
      activo: true,
    },
  });

  // Observar el tipo de cuota inicial para mostrar ayuda contextual
  const tipoCuotaInicial = form.watch("tipoCuotaInicial");

  // Manejar el envio del formulario
  const onSubmit = async (values: CreatePlanFinanciamientoFormData) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("nombre", values.nombre);
      formData.append("porcentajeAnual", values.porcentajeAnual.toString());
      formData.append("cantidadCuotas", values.cantidadCuotas.toString());
      formData.append("tipoCuotaInicial", values.tipoCuotaInicial);
      formData.append("valorCuotaInicial", values.valorCuotaInicial.toString());
      formData.append("activo", values.activo.toString());

      //Llamar a la acción del servidor
      const result = await createPlanFinanciamiento(formData);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        router.push("/dashboard/planes-financiamiento");
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CreatePlanFinanciamientoFormData, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al crear el Plan de Financiamiento :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar nuevo Plan de Financiamiento</CardTitle>
        <CardDescription>
          Configure los parámetros del plan de financiamiento para los lotes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Plan 12 meses" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre identificatorio del plan de financiamiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fila 1: Porcentaje Anual y Cantidad de Cuotas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="porcentajeAnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje Anual (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 15.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Tasa de interés anual</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cantidadCuotas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Cuotas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 12, 24, 36"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Número de cuotas mensuales</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fila 2: Tipo de Cuota Inicial y Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoCuotaInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cuota Inicial</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                        <SelectItem value="MONTO_FIJO">Monto Fijo ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Forma de calcular la cuota inicial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valorCuotaInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tipoCuotaInicial === "PORCENTAJE"
                        ? "Porcentaje de Cuota Inicial (%)"
                        : "Monto de Cuota Inicial ($)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={
                          tipoCuotaInicial === "PORCENTAJE"
                            ? "Ej: 20 (= 20%)"
                            : "Ej: 5000.00"
                        }
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {tipoCuotaInicial === "PORCENTAJE"
                        ? "Porcentaje del precio de contado (0-100)"
                        : "Monto fijo en moneda local"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Plan Activo</FormLabel>
                    <FormDescription>
                      Los planes activos estarán disponibles para asignar a lotes
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={isLoading}
                onClick={() => router.push("/dashboard/planes-financiamiento")}
              >
                Cancelar
              </Button>
              <Button type={"submit"} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Plan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
