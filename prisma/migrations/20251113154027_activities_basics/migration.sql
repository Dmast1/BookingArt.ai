-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT DEFAULT 'RO',
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "coverImage" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "description" TEXT,
    "priceFrom" INTEGER,
    "currency" TEXT DEFAULT 'EUR',
    "status" TEXT DEFAULT 'active',
    "durationMin" INTEGER,
    "minPeople" INTEGER,
    "maxPeople" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityPackage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "tag" TEXT,
    "durationHours" INTEGER,
    "maxPeople" INTEGER,
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActivityPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySlot" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "capacityTotal" INTEGER NOT NULL DEFAULT 1,
    "capacityBooked" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "note" TEXT,

    CONSTRAINT "ActivitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "activityId" TEXT NOT NULL,
    "slotId" TEXT,

    CONSTRAINT "ActivityOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "activityPackageId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "ActivityOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Activity_providerId_city_status_createdAt_idx" ON "Activity"("providerId", "city", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityPackage_activityId_sortOrder_idx" ON "ActivityPackage"("activityId", "sortOrder");

-- CreateIndex
CREATE INDEX "ActivitySlot_activityId_startAt_idx" ON "ActivitySlot"("activityId", "startAt");

-- CreateIndex
CREATE INDEX "ActivitySlot_status_startAt_idx" ON "ActivitySlot"("status", "startAt");

-- CreateIndex
CREATE INDEX "ActivityOrder_userId_createdAt_idx" ON "ActivityOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityOrder_activityId_createdAt_idx" ON "ActivityOrder"("activityId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityOrder_slotId_idx" ON "ActivityOrder"("slotId");

-- CreateIndex
CREATE INDEX "ActivityOrderItem_orderId_idx" ON "ActivityOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "ActivityOrderItem_activityPackageId_idx" ON "ActivityOrderItem"("activityPackageId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPackage" ADD CONSTRAINT "ActivityPackage_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySlot" ADD CONSTRAINT "ActivitySlot_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrder" ADD CONSTRAINT "ActivityOrder_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrder" ADD CONSTRAINT "ActivityOrder_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ActivitySlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrderItem" ADD CONSTRAINT "ActivityOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ActivityOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrderItem" ADD CONSTRAINT "ActivityOrderItem_activityPackageId_fkey" FOREIGN KEY ("activityPackageId") REFERENCES "ActivityPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
