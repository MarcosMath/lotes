"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// importar la accion del servidor
import { deleteLote } from "@/app/actions/lote/deleteLote";

//importar componentes IU
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteLoteFormProps {
  lote: {
    id: number;
    nombre: string;
    manzano: string;
    numero: number;
    zona: string;
    superficieM2: number;
    precioM2: number;
    precioContado: number;
    estado: "DISPONIBLE" | "ENPAGO" | "PAGADO";
    formaVenta: "CONTADO" | "CREDITO" | null;
    urbanizacion: {
      nombre: string;
    };
  };
}

export default function DeleteLoteForm({ lote }: DeleteLoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const estadoColors = {
    DISPONIBLE: "bg-green-500",
    ENPAGO: "bg-yellow-500",
    PAGADO: "bg-blue-500",
  };

  const estadoLabels = {
    DISPONIBLE: "Disponible",
    ENPAGO: "En Pago",
    PAGADO: "Pagado",
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", lote.id.toString());

      const result = await deleteLote(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/lotes");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al eliminar el Lote :", error);
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
          Eliminar Lote
        </CardTitle>
        <CardDescription>
          Esta acción es permanente y no se puede deshacer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del lote */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold mb-4">Información del lote:</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Lote:</dt>
              <dd className="font-medium">{lote.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Urbanización:</dt>
              <dd className="font-medium">{lote.urbanizacion.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Zona:</dt>
              <dd className="font-medium">{lote.zona}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Superficie:</dt>
              <dd className="font-medium">{lote.superficieM2.toFixed(2)} m²</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Precio/m²:</dt>
              <dd className="font-medium">Bs. {lote.precioM2.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Precio Contado:</dt>
              <dd className="font-bold text-primary">
                Bs. {lote.precioContado.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado:</dt>
              <dd>
                <Badge className={estadoColors[lote.estado]}>
                  {estadoLabels[lote.estado]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Forma Venta:</dt>
              <dd>
                {lote.formaVenta ? (
                  <Badge variant="outline">{lote.formaVenta}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Confirmación de eliminación */}
        <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
          <div className="flex gap-2">
            <AlertTriangle className="text-destructive shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-destructive mb-1">
                ¿Está seguro?
              </h4>
              <p className="text-sm text-muted-foreground">
                Esta acción eliminará permanentemente el lote "{lote.nombre}" y
                no se podrá recuperar.
              </p>
            </div>
          </div>
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
          <Button
            variant={"destructive"}
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Lote"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
