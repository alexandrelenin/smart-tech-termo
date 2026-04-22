-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "processRef" TEXT,
    "pregaoRef" TEXT,
    "contractRef" TEXT,
    "date" TEXT NOT NULL,
    "contratante" JSONB NOT NULL,
    "contratada" JSONB NOT NULL,
    "softwareDescription" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "techResponsible" JSONB NOT NULL,
    "installation" JSONB NOT NULL,
    "credentials" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);
