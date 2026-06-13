-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PackingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "transport" TEXT NOT NULL,
    "accommodation" TEXT NOT NULL,
    "companions" TEXT NOT NULL,
    "generatedItems" TEXT NOT NULL,
    "customItems" TEXT NOT NULL DEFAULT '[]',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PackingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SharedList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packingListId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedList_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PackingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL,
    "weight" REAL,
    "isLiquid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PackingItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");
