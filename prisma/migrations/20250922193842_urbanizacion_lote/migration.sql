-- CreateEnum
CREATE TYPE "public"."EstadoLote" AS ENUM ('DISPONIBLE', 'ENPAGO', 'PAGADO');

-- CreateEnum
CREATE TYPE "public"."FormaVenta" AS ENUM ('CONTADO', 'CREDITO');

-- CreateTable
CREATE TABLE "public"."urbanizaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,

    CONSTRAINT "urbanizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lotes" (
    "id" SERIAL NOT NULL,
    "manzano" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "superficieM2" DOUBLE PRECISION NOT NULL,
    "precioM2" DOUBLE PRECISION NOT NULL,
    "precioContado" DOUBLE PRECISION NOT NULL,
    "estado" "public"."EstadoLote" NOT NULL DEFAULT 'DISPONIBLE',
    "formaVenta" "public"."FormaVenta",
    "urbanizacionId" INTEGER NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urbanizaciones_nombre_key" ON "public"."urbanizaciones"("nombre");

-- AddForeignKey
ALTER TABLE "public"."lotes" ADD CONSTRAINT "lotes_urbanizacionId_fkey" FOREIGN KEY ("urbanizacionId") REFERENCES "public"."urbanizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
