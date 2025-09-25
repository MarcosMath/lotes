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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleEllipsis, Pencil, Trash2, Eye, CirclePlus } from "lucide-react";

export default async function UrbanizacionesPage() {
  const urbanizaciones = await prisma.urbanizacion.findMany();
  return (
    <div className="flex flex-col">
      {/* Header con titulo y boton crear */}
      <div className="flex justify-between items-center py-4 px-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Urbanizaciones
          </h1>
          <p className="text-muted-foreground">
            Administre la información de las Urbanizaciones
          </p>
        </div>
        <Link href={"/dashboard/urbanizaciones/create"}>
          <Button className="flex items-center gap-2">
            <CirclePlus size={18} /> Nueva Urbanización
          </Button>
        </Link>
      </div>
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-6 border-b bg-muted/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {urbanizaciones.length}
          </div>
          <div className="text-sm text-muted-foreground">Registradas</div>
        </div>
      </div>
      {/* Tabla Urbanizaciones */}
      <div className="p-6">
        {urbanizaciones.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CirclePlus className="mx-auto mb-4 opacity-50" />
              No Hay Urbanizaciones Registradas
            </div>
            <Link href={"dashboard/urbanizaciones/create"}>
              <Button>Crear primera urbanización</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableCaption>
              Lista de {urbanizaciones.length} registradas
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Urbanización</TableHead>
                <TableHead>Ubiacación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        )}
      </div>
    </div>
  );
}
