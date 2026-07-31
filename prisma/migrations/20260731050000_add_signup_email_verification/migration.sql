-- AlterTable
ALTER TABLE `SignupRequest` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SignupRequest_verificationToken_key` ON `SignupRequest`(`verificationToken`);
