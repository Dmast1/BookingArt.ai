/*
  Warnings:

  - A unique constraint covering the columns `[activityId,startAt,endAt]` on the table `ActivitySlot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ActivitySlot_activityId_startAt_endAt_key" ON "ActivitySlot"("activityId", "startAt", "endAt");
