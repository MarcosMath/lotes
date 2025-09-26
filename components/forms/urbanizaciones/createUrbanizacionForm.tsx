"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor y esquema para urbanizacion
import { createUrbanizacion } from "@/app/actions/urbanizacion/createUrbanizacion";
import {
  createUrbanizacionSchema,
  CreateUrbanizacionInput,
  CreateUrbanizacionFormData,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDiff, Loader2, UsbIcon } from "lucide-react";
import { tr } from "zod/v4/locales";
import { routerServerGlobal } from "next/dist/server/lib/router-utils/router-server-context";

export default function CreateUrbanizacionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Configurar el formulario con react-hook-form
  const form = useForm<CreateUrbanizacionFormData>({
    resolver: zodResolver(createUrbanizacionSchema),
    defaultValues: {
      nombre: "",
      ubicacion: "",
    },
  });

  // Manejar el envio del formulario
  const onSubmit = async (values: CreateUrbanizacionFormData) => {
    setIsLoading(true);

    try {
      console.log("Datos del Formulario :", values);

      // Crear un FormData para enviar a la acción del Servidor
      const formData = new FormData();
      formData.append("nombre", values.nombre);
      formData.append("ubicacion", values.ubicacion ?? "");

      //Llamar a la acción del servidor
      const result = await createUrbanizacion(formData);

      if (result.success) {
        toast.success(result.message);
        form.reset;
        router.push("/dashboard/urbanizaciones");
      } else {
        toast.error(result.message);

        // mostrar errores especificos del formulario
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CreateUrbanizacionFormData, {
              type: "server",
              message: messages.join(","),
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al crear la Urbanización :", error);
      toast.error("Error Inesperado intentalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar nueva Urbanización</CardTitle>
        <CardDescription>
          Complete la información de la urbanización
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
