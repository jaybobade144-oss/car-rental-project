import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

let dbPath = path.resolve(process.cwd(), "dev.db");

// On Vercel, the filesystem is read-only at runtime.
// We copy the database to /tmp to make it writable.
if (process.env.VERCEL) {
  let isWritable = false;
  try {
    const testFile = path.resolve(process.cwd(), ".write-test");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
    isWritable = true;
  } catch (e) {
    isWritable = false;
  }

  if (!isWritable) {
    const tempDbPath = "/tmp/dev.db";
    if (!fs.existsSync(tempDbPath)) {
      try {
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, tempDbPath);
        } else {
          // If the source db does not exist, create an empty one
          fs.writeFileSync(tempDbPath, "");
        }
      } catch (e) {
        console.error("Failed to copy database to /tmp:", e);
      }
    }
    dbPath = tempDbPath;
  }
}

const databaseUrl = `file:${dbPath}`;

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  });
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl,
    });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
