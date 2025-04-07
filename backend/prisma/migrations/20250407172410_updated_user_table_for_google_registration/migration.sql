-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
