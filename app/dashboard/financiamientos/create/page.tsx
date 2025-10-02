import prisma from "@/lib/prisma";
import CreateFinanciamientoLoteForm from "@/components/forms/financiamientoLote/createFinanciamientoLoteForm";

interface PageProps {
  searchParams: Promise<{ loteId?: string }>;
}

export default async function CreateFinanciamientoPage({ searchParams }: PageProps) {
  const { loteId } = await searchParams;
  const preselectedLoteId = loteId ? parseInt(loteId) : undefined;

  // Obtener lotes disponibles
  const lotes = await prisma.lote.findMany({
    select: {
      id: true,
      nombre: true,
      precioContado: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  // Obtener planes de financiamiento
  const planesFinanciamiento = await prisma.planFinanciamiento.findMany({
    select: {
      id: true,
      nombre: true,
      porcentajeAnual: true,
      cantidadCuotas: true,
      tipoCuotaInicial: true,
      valorCuotaInicial: true,
      activo: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="container mx-auto py-6">
      <CreateFinanciamientoLoteForm
        lotes={lotes}
        planesFinanciamiento={planesFinanciamiento}
        preselectedLoteId={preselectedLoteId}
      />
    </div>
  );
}
