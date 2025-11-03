import { getAuth } from "@clerk/express";
import * as userService from "../services/user/user-service.js";

/**
 * Retrieves all creations for the authenticated user
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Authentication information from Clerk
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with user's creations
 * @throws {Error} Forward errors to error handling middleware
 */
export const getUserCreations = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const creations = await userService.getUserCreations({ userId });

    res.status(200).json({
      success: true,
      creations,
    });
  } catch (error) {
    console.error("Error in user-controller.getUserCreations:", error);
    next(error);
  }
};

/**
 * Handles the like action for a specific creation
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Authentication information from Clerk
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.creationId - ID of the creation to like
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with updated creation
 * @throws {Error} Forward errors to error handling middleware
 */
export const likeCreation = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { creationId } = req.params;

    const updatedCreation = await userService.likeCreation({
      userId,
      creationId,
    });

    res.status(200).json({
      success: true,
      updatedCreation,
    });
  } catch (error) {
    console.error("Error in user-controller.likeCreation:", error);
    next(error);
  }
};

/**
 * Retrieves all public creations from all users
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with all public creations
 * @throws {Error} Forward errors to error handling middleware
 */
export const getPublicCreations = async (req, res, next) => {
  try {
    const creations = await userService.getPublicCreations();

    res.status(200).json({
      success: true,
      creations,
    });
  } catch (error) {
    console.error("Error in user-controller.getPublicCreations:", error);
    next(error);
  }
};
