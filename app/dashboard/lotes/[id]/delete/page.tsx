import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DeleteLoteForm from "@/components/forms/lotes/deleteLoteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeleteLotePage({ params }: PageProps) {
  const { id } = await params;
  const loteId = parseInt(id);

  if (isNaN(loteId)) {
    notFound();
  }

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: {
      urbanizacion: true,
    },
  });

  if (!lote) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <DeleteLoteForm lote={lote} />
    </div>
  );
}
