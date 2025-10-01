import prisma from "@/lib/prisma";
import CreateLoteForm from "@/components/forms/lotes/createLoteForm";

export default async function CreateLotePage() {
  const urbanizaciones = await prisma.urbanizacion.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <CreateLoteForm urbanizaciones={urbanizaciones} />
    </div>
  );
}
