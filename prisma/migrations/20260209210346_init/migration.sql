-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL PRIMARY KEY,
    "fightId" INTEGER NOT NULL,
    "fighter" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_fightId_voterId_key" ON "Vote"("fightId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_fightId_ipAddress_key" ON "Vote"("fightId", "ipAddress");
