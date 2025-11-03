import app from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";
import connectToCloudinary from "../src/config/cloudinary.js";

// Initialize database and cloudinary for serverless environment
let isInitialized = false;

const initializeServices = async () => {
  if (!isInitialized) {
    try {
      console.log("🚀 Initializing serverless services...");

      // Connect to database
      const dbConnected = await connectDatabase();
      if (!dbConnected) {
        throw new Error("Failed to connect to database");
      }

      // Connect to cloudinary
      await connectToCloudinary();

      isInitialized = true;
      console.log("✅ Serverless services initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize serverless services:", error);
      throw error;
    }
  }
};

// Wrap the app to ensure services are initialized
const handler = async (req, res) => {
  try {
    await initializeServices();
    return app(req, res);
  } catch (error) {
    console.error("Initialization error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
