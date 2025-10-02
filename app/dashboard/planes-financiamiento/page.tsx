import Link from "next/link";
import prisma from "@/lib/prisma";

import {
  Table,
  TableHead,
  TableHeader,
  TableCaption,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";

export default async function PlanesFinanciamientoPage() {
  const planes = await prisma.planFinanciamiento.findMany({
    include: {
      _count: {
        select: {
          financiamientos: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className="flex flex-col">
      {/* Header con titulo y boton crear */}
      <div className="flex justify-between items-center py-4 px-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Planes de Financiamiento
          </h1>
          <p className="text-muted-foreground">
            Configure los planes de financiamiento disponibles
          </p>
        </div>
        <Link href={"/dashboard/planes-financiamiento/create"}>
          <Button className="flex items-center gap-2">
            <CirclePlus size={18} /> Nuevo Plan
          </Button>
        </Link>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b bg-muted/30">
        <div className="text-center">
          <div className="text-2xl font-bold">{planes.length}</div>
          <div className="text-sm text-muted-foreground">Total Planes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {planes.filter((p) => p.activo).length}
          </div>
          <div className="text-sm text-muted-foreground">Planes Activos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {planes.reduce((acc, p) => acc + p._count.financiamientos, 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Financiamientos Creados
          </div>
        </div>
      </div>

      {/* Tabla Planes */}
      <div className="p-6">
        {planes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CirclePlus className="mx-auto mb-4 opacity-50" size={48} />
              No Hay Planes de Financiamiento Registrados
            </div>
            <Link href={"/dashboard/planes-financiamiento/create"}>
              <Button>Crear primer plan</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableCaption>
              Lista de {planes.length} planes de financiamiento
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cuotas</TableHead>
                <TableHead>% Anual</TableHead>
                <TableHead>Tipo Cuota Inicial</TableHead>
                <TableHead>Valor Cuota Inicial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Financiamientos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planes.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.nombre}</TableCell>
                  <TableCell>{plan.cantidadCuotas} meses</TableCell>
                  <TableCell>{plan.porcentajeAnual}%</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan.tipoCuotaInicial === "PORCENTAJE"
                        ? "Porcentaje"
                        : "Monto Fijo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plan.tipoCuotaInicial === "PORCENTAJE"
                      ? `${plan.valorCuotaInicial}%`
                      : `Bs. ${plan.valorCuotaInicial.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    {plan.activo ? (
                      <Badge className="bg-green-500">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan._count.financiamientos}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
