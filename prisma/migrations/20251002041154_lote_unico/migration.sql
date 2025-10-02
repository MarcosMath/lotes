/*
  Warnings:

  - A unique constraint covering the columns `[manzano,numero,urbanizacionId]` on the table `lotes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lotes_manzano_numero_urbanizacionId_key" ON "public"."lotes"("manzano", "numero", "urbanizacionId");
