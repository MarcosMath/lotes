"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema para lote
import { updateLote } from "@/app/actions/lote/updateLote";
import {
  updateLoteSchema,
  UpdateLoteFormData,
} from "@/app/schemas/lote";

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
import { Loader2 } from "lucide-react";

interface UpdateLoteFormProps {
  lote: {
    id: number;
    manzano: string;
    numero: number;
    nombre: string;
    zona: string;
    superficieM2: number;
    precioM2: number;
    precioContado: number;
    estado: "DISPONIBLE" | "ENPAGO" | "PAGADO";
    formaVenta: "CONTADO" | "CREDITO" | null;
    urbanizacionId: number;
  };
  urbanizaciones: Array<{
    id: number;
    nombre: string;
  }>;
}

export default function UpdateLoteForm({ lote, urbanizaciones }: UpdateLoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Configurar el formulario con react-hook-form
  const form = useForm<UpdateLoteFormData>({
    resolver: zodResolver(updateLoteSchema),
    defaultValues: {
      manzano: lote.manzano,
      numero: lote.numero,
      zona: lote.zona,
      superficieM2: lote.superficieM2,
      precioM2: lote.precioM2,
      estado: lote.estado,
      formaVenta: lote.formaVenta || undefined,
      urbanizacionId: lote.urbanizacionId,
    },
  });

  // Manejar el envio del formulario
  const onSubmit = async (values: UpdateLoteFormData) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("id", lote.id.toString());
      if (values.manzano !== undefined) formData.append("manzano", values.manzano);
      if (values.numero !== undefined) formData.append("numero", values.numero.toString());
      if (values.zona !== undefined) formData.append("zona", values.zona);
      if (values.superficieM2 !== undefined) formData.append("superficieM2", values.superficieM2.toString());
      if (values.precioM2 !== undefined) formData.append("precioM2", values.precioM2.toString());
      if (values.estado !== undefined) formData.append("estado", values.estado);
      if (values.formaVenta !== undefined) formData.append("formaVenta", values.formaVenta);
      if (values.urbanizacionId !== undefined) formData.append("urbanizacionId", values.urbanizacionId.toString());

      //Llamar a la acción del servidor
      const result = await updateLote(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/lotes");
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof UpdateLoteFormData, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al actualizar el Lote :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Lote: {lote.nombre}</CardTitle>
        <CardDescription>
          Actualice la información del lote. El nombre y precio contado se recalcularán automáticamente si modifica los campos relacionados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fila 1: Manzano y Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manzano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manzano</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: A" {...field} />
                    </FormControl>
                    <FormDescription>Identificador del manzano</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Número del lote</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo Zona */}
            <FormField
              control={form.control}
              name="zona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Norte" {...field} />
                  </FormControl>
                  <FormDescription>Zona donde se ubica el lote</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fila 2: Superficie y Precio M2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="superficieM2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Superficie (m²)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 250.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Superficie en metros cuadrados</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precioM2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por m²</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 150.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Precio por metro cuadrado</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fila 3: Estado y Forma de Venta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                        <SelectItem value="ENPAGO">En Pago</SelectItem>
                        <SelectItem value="PAGADO">Pagado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Estado actual del lote</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formaVenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Venta (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione forma de venta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONTADO">Contado</SelectItem>
                        <SelectItem value="CREDITO">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Forma de pago</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo Urbanización */}
            <FormField
              control={form.control}
              name="urbanizacionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urbanización</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione urbanización" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urbanizaciones.map((urb) => (
                        <SelectItem key={urb.id} value={urb.id.toString()}>
                          {urb.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Urbanización a la que pertenece el lote
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información del precio contado actual */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-2 text-sm">
                Precio Contado Actual:
              </h3>
              <p className="text-2xl font-bold text-primary">
                Bs. {lote.precioContado.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Se recalculará si modifica la superficie o el precio por m²
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={isLoading}
                onClick={() => router.push("/dashboard/lotes")}
              >
                Cancelar
              </Button>
              <Button type={"submit"} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Lote"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
