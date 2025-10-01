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
import {
  CircleEllipsis,
  Pencil,
  Trash2,
  CirclePlus,
  Eye,
} from "lucide-react";

export default async function LotesPage() {
  const lotes = await prisma.lote.findMany({
    include: {
      urbanizacion: true,
    },
    orderBy: {
      id: "desc",
    },
  });

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
    <div className="flex flex-col">
      {/* Header con titulo y boton crear */}
      <div className="flex justify-between items-center py-4 px-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Lotes
          </h1>
          <p className="text-muted-foreground">
            Administre la información de los Lotes
          </p>
        </div>
        <Link href={"/dashboard/lotes/create"}>
          <Button className="flex items-center gap-2">
            <CirclePlus size={18} /> Nuevo Lote
          </Button>
        </Link>
      </div>
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b bg-muted/30">
        <div className="text-center">
          <div className="text-2xl font-bold">{lotes.length}</div>
          <div className="text-sm text-muted-foreground">Total Lotes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {lotes.filter((l) => l.estado === "DISPONIBLE").length}
          </div>
          <div className="text-sm text-muted-foreground">Disponibles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {lotes.filter((l) => l.estado === "ENPAGO").length}
          </div>
          <div className="text-sm text-muted-foreground">En Pago</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {lotes.filter((l) => l.estado === "PAGADO").length}
          </div>
          <div className="text-sm text-muted-foreground">Pagados</div>
        </div>
      </div>
      {/* Tabla Lotes */}
      <div className="p-6">
        {lotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CirclePlus className="mx-auto mb-4 opacity-50" />
              No Hay Lotes Registrados
            </div>
            <Link href={"/dashboard/lotes/create"}>
              <Button>Crear primer lote</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableCaption>Lista de {lotes.length} lotes registrados</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Urbanización</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Superficie (m²)</TableHead>
                <TableHead>Precio/m²</TableHead>
                <TableHead>Precio Contado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Forma Venta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map((lote) => (
                <TableRow key={lote.id}>
                  <TableCell className="font-medium">{lote.nombre}</TableCell>
                  <TableCell>{lote.urbanizacion.nombre}</TableCell>
                  <TableCell>{lote.zona}</TableCell>
                  <TableCell>{lote.superficieM2.toFixed(2)}</TableCell>
                  <TableCell>Bs. {lote.precioM2.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">
                    Bs. {lote.precioContado.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColors[lote.estado]}>
                      {estadoLabels[lote.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lote.formaVenta ? (
                      <Badge variant="outline">{lote.formaVenta}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"sm"}>
                          <CircleEllipsis size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/lotes/${lote.id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Eye size={16} />
                            Ver Detalle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/lotes/${lote.id}/update`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil size={16} />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/lotes/${lote.id}/delete`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
