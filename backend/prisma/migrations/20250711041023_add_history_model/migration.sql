-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "dish_name" TEXT NOT NULL,
    "calories_per_serving" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "total_calories" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "History_email_key" ON "History"("email");
