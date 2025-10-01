import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import UpdateLoteForm from "@/components/forms/lotes/updateLoteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateLotePage({ params }: PageProps) {
  const { id } = await params;
  const loteId = parseInt(id);

  if (isNaN(loteId)) {
    notFound();
  }

  const [lote, urbanizaciones] = await Promise.all([
    prisma.lote.findUnique({
      where: { id: loteId },
      include: {
        urbanizacion: true,
      },
    }),
    prisma.urbanizacion.findMany({
      orderBy: {
        nombre: "asc",
      },
    }),
  ]);

  if (!lote) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <UpdateLoteForm lote={lote} urbanizaciones={urbanizaciones} />
    </div>
  );
}
