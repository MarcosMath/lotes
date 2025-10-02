-- CreateEnum
CREATE TYPE "public"."TipoCuotaInicial" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateTable
CREATE TABLE "public"."planes_financiamiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcentajeAnual" DOUBLE PRECISION NOT NULL,
    "cantidadCuotas" INTEGER NOT NULL,
    "tipoCuotaInicial" "public"."TipoCuotaInicial" NOT NULL,
    "valorCuotaInicial" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financiamientos_lote" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "planFinanciamientoId" INTEGER NOT NULL,
    "cuotaInicial" DOUBLE PRECISION NOT NULL,
    "saldoFinanciar" DOUBLE PRECISION NOT NULL,
    "interesTotal" DOUBLE PRECISION NOT NULL,
    "cuotaMensual" DOUBLE PRECISION NOT NULL,
    "precioTotalCredito" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financiamientos_lote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planes_financiamiento_nombre_key" ON "public"."planes_financiamiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "financiamientos_lote_loteId_planFinanciamientoId_key" ON "public"."financiamientos_lote"("loteId", "planFinanciamientoId");

-- AddForeignKey
ALTER TABLE "public"."financiamientos_lote" ADD CONSTRAINT "financiamientos_lote_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "public"."lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financiamientos_lote" ADD CONSTRAINT "financiamientos_lote_planFinanciamientoId_fkey" FOREIGN KEY ("planFinanciamientoId") REFERENCES "public"."planes_financiamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
