import { getAuth } from "@clerk/express";

/**
 * Debug middleware for Clerk authentication that logs authentication details to the console.
 *
 * This middleware extracts authentication information from the request using Clerk's getAuth()
 * and logs relevant debugging information including user ID, session ID, claims, and headers.
 * It also warns when no user ID is found, indicating potential authentication failures.
 *
 * @param {Object} req - Express request object containing authentication data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 * Use as middleware in Express route
 * app.use('/api', debugClerkAuth, protectedRoute);
 *
 * @since 1.0.0
 */
export const debugClerkAuth = (req, res, next) => {
  const auth = getAuth(req);

  console.log("🔍 Auth Debug:", {
    userId: auth?.userId,
    sessionId: auth?.sessionId,
    has: auth?.has,
    claims: auth?.claims,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie?.substring(0, 50) + "...", // truncated
    },
  });

  if (!auth?.userId) {
    console.error("❌ No userId found - authentication will fail");
  }

  next();
};
