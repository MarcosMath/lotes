import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import UpdateUrbanizacionForm from "@/components/forms/urbanizaciones/updateUrbanizacionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateUrbanizacionPage({ params }: PageProps) {
  const { id } = await params;
  const urbanizacionId = parseInt(id);

  if (isNaN(urbanizacionId)) {
    notFound();
  }

  const urbanizacion = await prisma.urbanizacion.findUnique({
    where: { id: urbanizacionId },
  });

  if (!urbanizacion) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <UpdateUrbanizacionForm urbanizacion={urbanizacion} />
    </div>
  );
}
