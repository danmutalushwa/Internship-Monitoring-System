/*
  Warnings:

  - You are about to drop the column `internshipCompany` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `internshipStatus` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "facultyId" INTEGER,
    "assignedSupervisorId" INTEGER,
    "assignedLecturerId" INTEGER,
    "lastLogin" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedReviewerId" INTEGER,
    CONSTRAINT "User_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_assignedSupervisorId_fkey" FOREIGN KEY ("assignedSupervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_assignedLecturerId_fkey" FOREIGN KEY ("assignedLecturerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("assignedLecturerId", "assignedReviewerId", "assignedSupervisorId", "createdAt", "email", "facultyId", "id", "isActive", "isDeleted", "lastLogin", "name", "password", "role") SELECT "assignedLecturerId", "assignedReviewerId", "assignedSupervisorId", "createdAt", "email", "facultyId", "id", "isActive", "isDeleted", "lastLogin", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
