/*
  Warnings:

  - A unique constraint covering the columns `[matchId,language,kind]` on the table `AISummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AISummary_matchId_language_kind_key" ON "AISummary"("matchId", "language", "kind");
