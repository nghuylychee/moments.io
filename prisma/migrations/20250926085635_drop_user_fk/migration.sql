-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "number_no" INTEGER NOT NULL,
    "front_image_url" TEXT NOT NULL,
    "back_video_url" TEXT NOT NULL,
    "video_duration_sec" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" DATETIME
);
INSERT INTO "new_Card" ("back_video_url", "created_at", "created_by", "front_image_url", "id", "number_no", "published_at", "slug", "status", "title", "type", "video_duration_sec") SELECT "back_video_url", "created_at", "created_by", "front_image_url", "id", "number_no", "published_at", "slug", "status", "title", "type", "video_duration_sec" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");
CREATE INDEX "Card_created_by_idx" ON "Card"("created_by");
CREATE INDEX "Card_status_idx" ON "Card"("status");
CREATE INDEX "Card_created_by_status_idx" ON "Card"("created_by", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
