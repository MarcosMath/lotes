"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema para lote
import { createLote } from "@/app/actions/lote/createLote";
import {
  createLoteSchema,
  CreateLoteFormData,
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

interface CreateLoteFormProps {
  urbanizaciones: Array<{
    id: number;
    nombre: string;
  }>;
}

export default function CreateLoteForm({ urbanizaciones }: CreateLoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Configurar el formulario con react-hook-form
  const form = useForm<CreateLoteFormData>({
    resolver: zodResolver(createLoteSchema),
    defaultValues: {
      manzano: "",
      numero: 0,
      zona: "",
      superficieM2: 0,
      precioM2: 0,
      estado: "DISPONIBLE",
      formaVenta: undefined,
      urbanizacionId: 0,
    },
  });

  // Manejar el envio del formulario
  const onSubmit = async (values: CreateLoteFormData) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("manzano", values.manzano);
      formData.append("numero", values.numero.toString());
      formData.append("zona", values.zona);
      formData.append("superficieM2", values.superficieM2.toString());
      formData.append("precioM2", values.precioM2.toString());
      formData.append("estado", values.estado);
      if (values.formaVenta) formData.append("formaVenta", values.formaVenta);
      formData.append("urbanizacionId", values.urbanizacionId.toString());

      //Llamar a la acción del servidor
      const result = await createLote(formData);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        router.push("/dashboard/lotes");
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CreateLoteFormData, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al crear el Lote :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar nuevo Lote</CardTitle>
        <CardDescription>
          Complete la información del lote. El nombre y precio contado se calcularán automáticamente.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    Creando...
                  </>
                ) : (
                  "Crear Lote"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
