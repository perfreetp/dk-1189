/*
  Warnings:

  - Added the required column `sharedByEmail` to the `SharedList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedByUsername` to the `SharedList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedWithEmail` to the `SharedList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedWithUsername` to the `SharedList` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packingListId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SharedList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packingListId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedByEmail" TEXT NOT NULL,
    "sharedByUsername" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "sharedWithEmail" TEXT NOT NULL,
    "sharedWithUsername" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedList_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SharedList" ("createdAt", "id", "packingListId", "permission", "sharedBy", "sharedWith") SELECT "createdAt", "id", "packingListId", "permission", "sharedBy", "sharedWith" FROM "SharedList";
DROP TABLE "SharedList";
ALTER TABLE "new_SharedList" RENAME TO "SharedList";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
