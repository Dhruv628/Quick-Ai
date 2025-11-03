import "dotenv/config";

const port = process.env.PORT || 3000;
import app from "./src/app.js";
import {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
} from "./src/config/database.js";
import connectToCloudinary from "./src/config/cloudinary.js";

async function startServer() {
  try {
    console.log("🚀 Starting server...");

    // * init DB connection
    const dbConnected = await connectDatabase();

    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Server will not start.");
      process.exit(1);
    }

    // * connect to cloudinary
    await connectToCloudinary();

    // * start the server
    const server = app.listen(port, () => {
      console.log(`🎉 Server started successfully!`);
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`�️  Database: Connected`);
      console.log(`� Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // * Graceful shutdown handling
    process.on("SIGINT", async () => {
      console.log("\n🛑 Received SIGINT. Graceful shutdown...");
      server.close(async () => {
        await disconnectDatabase();
        console.log("� Server closed successfully");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("\n� Received SIGTERM. Graceful shutdown...");
      server.close(async () => {
        await disconnectDatabase();
        console.log("� Server closed successfully");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
    process.exit(1);
  }
}

// Health check endpoint can use this
export { isDatabaseConnected };

startServer();
