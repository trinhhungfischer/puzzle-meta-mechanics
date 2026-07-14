-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");
