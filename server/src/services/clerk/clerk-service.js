import { clerkClient } from "@clerk/express";

import BadRequestError from "../../utils/errors/bad-request-error.js";
import { USER_PLAN } from "../../utils/constants/constants.js";

/**
 * Validates if a user can proceed based on their plan and usage limits
 * @function clerkPlanCheck
 * @param {string} plan - The user's current plan (FREE or PREMIUM)
 * @param {number} free_usage - The current count of free usage for the user
 * @param {boolean} premiumOnly - Whether the feature is restricted to premium users
 * @throws {BadRequestError} Throws error if free user has reached the usage limit (10)
 * @description This function checks if a free user has exceeded their usage limit.
 * Premium users can proceed without restrictions. Free users are limited to 10 operations.
 * @example
 * Check if user can proceed
 * clerkPlanCheck(USER_PLAN.FREE, 9); // ✅ Passes - under limit
 * clerkPlanCheck(USER_PLAN.FREE, 10); // ❌ Throws error - at limit
 * clerkPlanCheck(USER_PLAN.PREMIUM, 100); // ✅ Passes - premium user
 */
export const clerkPlanCheck = ({ plan, free_usage, premiumOnly = false }) => {
  if (premiumOnly && plan !== USER_PLAN.PREMIUM) {
    throw new BadRequestError("Upgrade to premium plan to access this feature");
  }
  if (plan !== USER_PLAN.PREMIUM && free_usage >= 10) {
    throw new BadRequestError(
      "Limit reached, upgrade to premium plan to continue"
    );
  }
  return true;
};

/**
 * Increments the free usage counter for non-premium users
 * @async
 * @function increaseClerkCreditUsage
 * @param {string} userId - The unique identifier for the user from Clerk
 * @param {string} plan - The user's current plan (FREE or PREMIUM)
 * @param {number} free_usage - The current count of free usage for the user
 * @returns {Promise<void>} Resolves when the metadata update is complete
 * @throws {Error} Throws error if Clerk API update fails
 * @description This function increments the usage counter for free users by updating
 * their private metadata in Clerk. Premium users are not affected as they have unlimited usage.
 * The function updates the user's privateMetadata.free_usage field with the incremented value.
 * @example
 * Increment usage for a free user
 * await increaseClerkCreditUsage("user_123", USER_PLAN.FREE, 5);
 * Result: user's free_usage becomes 6
 *
 * Premium user - no action taken
 * await increaseClerkCreditUsage("user_456", USER_PLAN.PREMIUM, 100);
 * Result: no change to user metadata
 */
export const increaseClerkCreditUsage = async ({
  userId,
  plan,
  free_usage,
}) => {
  try {
    if (plan !== USER_PLAN.PREMIUM) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }
    return true;
  } catch (error) {
    console.error("Error in clerk-service.increaseClerkCreditUsage: ", error);
    throw error;
  }
};
