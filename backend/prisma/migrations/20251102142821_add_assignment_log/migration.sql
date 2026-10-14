-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportFeedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportFeedback_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportFeedback_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReportFeedback" ("content", "createdAt", "feedback", "id", "parentId", "reportId", "reviewerId", "status", "updatedAt") SELECT "content", "createdAt", "feedback", "id", "parentId", "reportId", "reviewerId", "status", "updatedAt" FROM "ReportFeedback";
DROP TABLE "ReportFeedback";
ALTER TABLE "new_ReportFeedback" RENAME TO "ReportFeedback";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
