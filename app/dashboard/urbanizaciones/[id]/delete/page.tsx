import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DeleteUrbanizacionForm from "@/components/forms/urbanizaciones/deleteUrbanizacionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeleteUrbanizacionPage({ params }: PageProps) {
  const { id } = await params;
  const urbanizacionId = parseInt(id);

  if (isNaN(urbanizacionId)) {
    notFound();
  }

  const urbanizacion = await prisma.urbanizacion.findUnique({
    where: { id: urbanizacionId },
    include: {
      lotes: true,
    },
  });

  if (!urbanizacion) {
    notFound();
  }

  const cantidadLotes = urbanizacion.lotes.length;

  return (
    <div className="container mx-auto py-8">
      <DeleteUrbanizacionForm
        urbanizacion={urbanizacion}
        cantidadLotes={cantidadLotes}
      />
    </div>
  );
}
