// Middlware to check userId and hasPremiumPlan

import { clerkClient, getAuth } from "@clerk/express";
import { USER_PLAN } from "../../utils/constants/constants.js";
import BadRequestError from "../../utils/errors/bad-request-error.js";

/**
 * Authentication middleware that validates user authentication and manages usage limits
 * @async
 * @function auth
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Authentication object containing userId and has method
 * @param {string} req.auth.userId - The authenticated user's ID
 * @param {Function} req.auth.has - Method to check user permissions/plans
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description This middleware:
 * - Verifies user authentication via Clerk
 * - Checks if user has premium plan subscription
 * - Manages free usage tracking in user's private metadata
 * - Sets req.free_usage and req.plan for downstream middleware
 * - Resets free usage to 0 for premium users or new users
 * @throws {Error} Returns 401 Unauthorized if authentication fails
 */
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = getAuth(req);
    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata?.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }
    req.plan = hasPremiumPlan ? USER_PLAN.PREMIUM : USER_PLAN.FREE;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    throw new BadRequestError("Unauthorized, Authentication failed");
  }
};
