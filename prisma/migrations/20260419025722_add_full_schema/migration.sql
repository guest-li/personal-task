-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "PartnerLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'inactive';

-- AlterTable
ALTER TABLE "partner_profiles" ADD COLUMN     "level" "PartnerLevel" NOT NULL DEFAULT 'beginner';

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "passport_nid" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "continent" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" "Gender";

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
