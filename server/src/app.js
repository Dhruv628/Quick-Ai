import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { requireAuth, clerkMiddleware } from "@clerk/express";
import errorHandler from "./middlwares/error-handler/index.js";
import router from "./routes/index.js";
import { debugClerkAuth } from "./middlwares/auth/debug-clerk-auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // * http request logging with Morgan

if (process.env.NODE_ENV == "development") app.use(debugClerkAuth); // * Use it BEFORE requireAuth

app.use(requireAuth()); // * global auth protection
app.use(router); // * routes

app.use(errorHandler);

export default app;
