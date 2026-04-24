-- AlterTable
ALTER TABLE "universities" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");
