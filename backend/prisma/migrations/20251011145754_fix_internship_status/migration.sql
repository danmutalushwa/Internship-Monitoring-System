/*
  Warnings:

  - You are about to drop the column `internshipStastus` on the `User` table. All the data in the column will be lost.

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
    "assignedSupervisorId" INTEGER,
    "assignedLecturerId" INTEGER,
    "facultyId" INTEGER,
    "internshipCompany" TEXT,
    "internshipStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("assignedLecturerId", "assignedSupervisorId", "createdAt", "email", "facultyId", "id", "internshipCompany", "name", "password", "role") SELECT "assignedLecturerId", "assignedSupervisorId", "createdAt", "email", "facultyId", "id", "internshipCompany", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
