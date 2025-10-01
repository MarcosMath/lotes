"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor
import { deleteUrbanizacion } from "@/app/actions/urbanizacion/deleteUrbanizacion";

//importar componentes IU
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteUrbanizacionFormProps {
  urbanizacion: {
    id: number;
    nombre: string;
    ubicacion: string | null;
  };
  cantidadLotes: number;
}

export default function DeleteUrbanizacionForm({
  urbanizacion,
  cantidadLotes,
}: DeleteUrbanizacionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const tieneLotes = cantidadLotes > 0;

  const handleDelete = async () => {
    if (tieneLotes) {
      toast.error(
        `No se puede eliminar esta urbanización porque tiene ${cantidadLotes} lote(s) asociado(s)`
      );
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", urbanizacion.id.toString());

      const result = await deleteUrbanizacion(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/urbanizaciones");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al eliminar la Urbanización :", error);
      toast.error("Error inesperado, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={24} />
          Eliminar Urbanización
        </CardTitle>
        <CardDescription>
          Esta acción es permanente y no se puede deshacer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información de la urbanización */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">
            Información de la urbanización:
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nombre:</dt>
              <dd className="font-medium">{urbanizacion.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Ubicación:</dt>
              <dd className="font-medium">
                {urbanizacion.ubicacion || "No especificada"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Lotes asociados:</dt>
              <dd
                className={`font-bold ${tieneLotes ? "text-destructive" : "text-green-600"}`}
              >
                {cantidadLotes}
              </dd>
            </div>
          </dl>
        </div>

        {/* Advertencia si tiene lotes */}
        {tieneLotes && (
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
            <div className="flex gap-2">
              <AlertTriangle className="text-destructive shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-destructive mb-1">
                  No se puede eliminar
                </h4>
                <p className="text-sm text-muted-foreground">
                  Esta urbanización tiene {cantidadLotes} lote(s) asociado(s).
                  Primero debe eliminar o reasignar todos los lotes antes de
                  poder eliminar la urbanización.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmación de eliminación */}
        {!tieneLotes && (
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
            <div className="flex gap-2">
              <AlertTriangle className="text-destructive shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-destructive mb-1">
                  ¿Está seguro?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará permanentemente la urbanización "
                  {urbanizacion.nombre}" y no se podrá recuperar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant={"outline"}
            disabled={isLoading}
            onClick={() => router.push("/dashboard/urbanizaciones")}
          >
            Cancelar
          </Button>
          <Button
            variant={"destructive"}
            disabled={isLoading || tieneLotes}
            onClick={handleDelete}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Urbanización"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
