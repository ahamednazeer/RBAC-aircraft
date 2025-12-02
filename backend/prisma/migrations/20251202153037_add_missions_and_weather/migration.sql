-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('TRAINING', 'PATROL', 'TRANSPORT', 'MAINTENANCE_FERRY', 'SEARCH_AND_RESCUE', 'OTHER');

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "aircraftId" TEXT,
    "pilotId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "MissionStatus" NOT NULL DEFAULT 'PLANNED',
    "type" "MissionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "windDirection" DOUBLE PRECISION,
    "visibility" DOUBLE PRECISION,
    "humidity" INTEGER,
    "pressure" INTEGER,
    "rawJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE INDEX "Mission_startTime_idx" ON "Mission"("startTime");

-- CreateIndex
CREATE INDEX "Mission_pilotId_idx" ON "Mission"("pilotId");

-- CreateIndex
CREATE INDEX "Mission_aircraftId_idx" ON "Mission"("aircraftId");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_timestamp_idx" ON "WeatherSnapshot"("timestamp");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
