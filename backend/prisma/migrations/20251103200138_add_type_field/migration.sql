-- AlterTable
ALTER TABLE "Report" ADD COLUMN "type" TEXT;

-- CreateTable
CREATE TABLE "AssignmentLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "assignedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssignmentLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentLog_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentLog_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AssignmentLog_studentId_idx" ON "AssignmentLog"("studentId");

-- CreateIndex
CREATE INDEX "AssignmentLog_reviewerId_idx" ON "AssignmentLog"("reviewerId");

-- CreateIndex
CREATE INDEX "AssignmentLog_assignedBy_idx" ON "AssignmentLog"("assignedBy");
