/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_deletedAt_idx` ON `User`;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `favoriteActivities` JSON NULL,
    ADD COLUMN `mainGoal` ENUM('LOSE_WEIGHT', 'BUILD_MUSCLE', 'GET_STRONGER', 'IMPROVE_ENDURANCE', 'STAY_ACTIVE') NULL,
    ADD COLUMN `weeklyWorkoutTarget` TINYINT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `deletedAt`,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
