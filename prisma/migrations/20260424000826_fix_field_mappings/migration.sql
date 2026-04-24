/*
  Warnings:

  - You are about to drop the column `createdAt` on the `blog_posts` table. All the data in the column will be lost.
  - You are about to drop the column `featuredImage` on the `blog_posts` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `blog_posts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `blog_posts` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `blog_posts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCharge` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `universities` table. All the data in the column will be lost.
  - You are about to drop the column `studentCount` on the `universities` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `universities` table. All the data in the column will be lost.
  - You are about to drop the column `worldRank` on the `universities` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `blog_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_charge` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `university_id` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `university_id` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `universities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_universityId_fkey";

-- DropForeignKey
ALTER TABLE "scholarships" DROP CONSTRAINT "scholarships_universityId_fkey";

-- AlterTable
ALTER TABLE "blog_posts" DROP COLUMN "createdAt",
DROP COLUMN "featuredImage",
DROP COLUMN "publishedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "viewCount",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "featured_image" TEXT,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "createdAt",
DROP COLUMN "serviceCharge",
DROP COLUMN "universityId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "service_charge" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "university_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "createdAt",
DROP COLUMN "universityId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "university_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "universities" DROP COLUMN "createdAt",
DROP COLUMN "studentCount",
DROP COLUMN "updatedAt",
DROP COLUMN "worldRank",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "student_count" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "world_rank" INTEGER;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
