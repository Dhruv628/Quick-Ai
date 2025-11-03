import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

let prisma;

async function connectDatabase() {
  try {
    const connectionString = process.env.DATABASE_URL;

    console.log("🔄 Connecting to database...");

    if (!connectionString) {
      console.error("💡 DATABASE_URL environment variable is not set");
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Skip Neon adapter in development to speed up connections
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Using optimized development connection...");

      // Use standard Prisma client with optimized settings for development
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: ["error", "info", "warn"], // Reduced logging for faster startup
        __internal: {
          engine: {
            connectTimeout: 5000, // 5 second timeout for faster fails
            queryTimeout: 10000, // 10 second query timeout
          },
        },
      });

      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;

      console.log("✅ Development database connection successful!");
    } else {
      // Production: Try Neon adapter first, fallback to standard
      console.log("🔄 Attempting Neon adapter connection...");

      try {
        const pool = new Pool({ connectionString });

        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();

        const adapter = new PrismaNeon(pool);

        prisma = new PrismaClient({
          adapter,
          log: ["error", "info", "warn"],
        });

        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;

        console.log("🎉 Neon adapter connection successful!");
      } catch (adapterError) {
        console.log(
          "⚠️ Neon adapter failed, falling back to standard Prisma..."
        );

        prisma = new PrismaClient({
          datasources: {
            db: {
              url: connectionString,
            },
          },
          log: ["error"],
        });

        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;

        console.log("✅ Standard Prisma connection successful!");
      }
    }

    console.log("✅ Database connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return false;
  }
}

// * function to check if database is connected
async function isDatabaseConnected() {
  try {
    if (!prisma) {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

// * function to get prisma instance (with initialization if needed)
function getPrismaClient() {
  if (!prisma) {
    console.warn("⚠️ Prisma client not initialized, creating new instance...");
    // Create a basic Prisma client as fallback
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ["error"],
    });
  }
  return prisma;
}

// * graceful shutdown
async function disconnectDatabase() {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log("🔌 Database disconnected successfully");
    }
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

export {
  connectDatabase,
  isDatabaseConnected,
  disconnectDatabase,
  prisma,
  getPrismaClient,
};
