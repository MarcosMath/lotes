import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Trash2, MapPin, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const loteId = parseInt(id);

  if (isNaN(loteId)) {
    notFound();
  }

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: {
      urbanizacion: true,
      financiamientos: {
        include: {
          planFinanciamiento: true,
        },
      },
    },
  });

  if (!lote) {
    notFound();
  }

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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header con botón de regreso */}
      <div className="mb-6">
        <Link href="/dashboard/lotes">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Lotes
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Lote {lote.nombre}
            </h1>
            <p className="text-muted-foreground mt-1">
              Información detallada del lote
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/lotes/${lote.id}/update`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Link href={`/dashboard/lotes/${lote.id}/delete`}>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información Principal</CardTitle>
            <CardDescription>Datos básicos del lote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Identificación */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                IDENTIFICACIÓN
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="text-lg font-semibold">{lote.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manzano</p>
                  <p className="text-lg font-medium">{lote.manzano}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="text-lg font-medium">{lote.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zona</p>
                  <p className="text-lg font-medium">{lote.zona}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Urbanización */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                UBICACIÓN
              </h3>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-lg">
                    {lote.urbanizacion.nombre}
                  </p>
                  {lote.urbanizacion.ubicacion && (
                    <p className="text-sm text-muted-foreground">
                      {lote.urbanizacion.ubicacion}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Medidas y Superficie */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                MEDIDAS Y SUPERFICIE
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Superficie Total
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {lote.superficieM2.toFixed(2)} m²
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel Lateral - Estado y Precios */}
        <div className="space-y-6">
          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del Lote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Estado Actual
                </p>
                <Badge className={`${estadoColors[lote.estado]} text-base px-4 py-2`}>
                  {estadoLabels[lote.estado]}
                </Badge>
              </div>
              {lote.formaVenta && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Forma de Venta
                  </p>
                  <Badge variant="outline" className="text-base px-4 py-2">
                    {lote.formaVenta}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Precio por m²</p>
                <p className="text-2xl font-bold">
                  Bs. {lote.precioM2.toFixed(2)}
                </p>
              </div>
              <Separator />
              <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-1">
                  Precio Contado Total
                </p>
                <p className="text-3xl font-bold text-primary">
                  Bs. {lote.precioContado.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Calculado: {lote.superficieM2.toFixed(2)} m² × Bs.{" "}
                  {lote.precioM2.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-medium">#{lote.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Superficie:</span>
                <span className="font-medium">
                  {lote.superficieM2.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio/m²:</span>
                <span className="font-medium">
                  Bs. {lote.precioM2.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary">
                  Bs. {lote.precioContado.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección de Financiamientos */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Planes de Financiamiento Disponibles
                </CardTitle>
                <CardDescription>
                  Opciones de financiamiento configuradas para este lote
                </CardDescription>
              </div>
              <Link href={`/dashboard/financiamientos/create?loteId=${lote.id}`}>
                <Button size="sm">Agregar Plan</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lote.financiamientos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay planes de financiamiento configurados para este lote
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Cuota Inicial</TableHead>
                    <TableHead>Cuota Mensual</TableHead>
                    <TableHead>Precio Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lote.financiamientos.map((financiamiento) => (
                    <TableRow key={financiamiento.id}>
                      <TableCell className="font-medium">
                        {financiamiento.planFinanciamiento.nombre}
                      </TableCell>
                      <TableCell>
                        {financiamiento.planFinanciamiento.cantidadCuotas} meses
                      </TableCell>
                      <TableCell>
                        Bs. {financiamiento.cuotaInicial.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        Bs. {financiamiento.cuotaMensual.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        Bs. {financiamiento.precioTotalCredito.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
