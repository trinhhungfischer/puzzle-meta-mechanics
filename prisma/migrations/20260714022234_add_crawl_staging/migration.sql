-- CreateTable
CREATE TABLE "CrawlRecord" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "CrawlRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrawlRecord_source_processedAt_idx" ON "CrawlRecord"("source", "processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlRecord_source_sourceId_kind_key" ON "CrawlRecord"("source", "sourceId", "kind");
