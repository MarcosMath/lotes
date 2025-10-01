"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema para urbanizacion
import { updateUrbanizacion } from "@/app/actions/urbanizacion/updateUrbanizacion";
import {
  updateUrbanizacionSchema,
  UpdateUrbanizacionInput,
} from "@/app/schemas/urbanizacion";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface UpdateUrbanizacionFormProps {
  urbanizacion: {
    id: number;
    nombre: string;
    ubicacion: string | null;
  };
}

export default function UpdateUrbanizacionForm({
  urbanizacion,
}: UpdateUrbanizacionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Configurar el formulario con react-hook-form
  const form = useForm<UpdateUrbanizacionInput>({
    resolver: zodResolver(updateUrbanizacionSchema),
    defaultValues: {
      nombre: urbanizacion.nombre,
      ubicacion: urbanizacion.ubicacion || "",
    },
  });

  // Manejar el envio del formulario
  const onSubmit = async (values: UpdateUrbanizacionInput) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("id", urbanizacion.id.toString());
      if (values.nombre) formData.append("nombre", values.nombre);
      if (values.ubicacion) formData.append("ubicacion", values.ubicacion);

      //Llamar a la acción del servidor
      const result = await updateUrbanizacion(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/urbanizaciones");
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof UpdateUrbanizacionInput, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al actualizar la Urbanización :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Urbanización</CardTitle>
        <CardDescription>
          Actualice la información de la urbanización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo nombre*/}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Las Palmas" {...field}></Input>
                  </FormControl>
                  <FormDescription>
                    Ingrese el nombre de la urbanización
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo ubicacion*/}
            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Trinidad norte, Km 8"
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormDescription>
                    Ingrese el la Ubiacación de la Urbanización
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Botones de acción  */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={isLoading}
                onClick={() => router.push("/dashboard/urbanizaciones")}
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
                  "Actualizar Urbanización"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
