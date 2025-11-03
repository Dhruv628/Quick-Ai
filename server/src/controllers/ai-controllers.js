import { getAuth } from "@clerk/express";
import * as aiService from "../services/ai/ai-service.js";
import {
  clerkPlanCheck,
  increaseClerkCreditUsage,
} from "../services/clerk/clerk-service.js";
import BadRequestError from "../utils/errors/bad-request-error.js";

/**
 * Generates an article based on the provided prompt and length.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.prompt - The prompt for the article.
 * @param {number} req.body.length - The desired length of the article.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const generateArticle = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage });

    const creation = await aiService.generateArticle({
      userId,
      prompt,
      length,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.generateArticle:", error);
    next(error);
  }
};

/**
 * Generates blog titles based on the provided prompt.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.prompt - The prompt for the blog titles.
 * @param {string} req.body.category - The category for the blog titles.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const generateBlogTitles = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, category } = req.body;
    const { plan, free_usage } = req;

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage });

    const creation = await aiService.generateBlogTitles({
      userId,
      prompt,
      category,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.generateBlogTitles:", error);
    next(error);
  }
};

/**
 * Generates an image based on the provided prompt and publish option.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.prompt - The prompt for the image.
 * @param {string} req.body.style - The style of the image.
 * @param {boolean} req.body.publish - Whether to publish the image.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const generateImage = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, style, publish } = req.body;
    const { plan, free_usage } = req;

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage, premiumOnly: true });

    const creation = await aiService.generateImage({
      userId,
      prompt,
      style,
      publish,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.generateImage:", error);
    next(error);
  }
};

/**
 * Removes background from the provided image.
 * @param {Object} req - The request object.
 * @param {Object} req.file - The uploaded file.
 * @param {Buffer} req.file.image - The image buffer.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const removeBackground = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { plan, free_usage } = req;

    if (!req.file) {
      throw new BadRequestError("No image uploaded");
    }

    // * create base64 string from buffer
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage, premiumOnly: true });

    const creation = await aiService.removeBackground({
      userId,
      image: base64Image,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.removeBackground:", error);
    next(error);
  }
};

/**
 * Removes an object from the provided image.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.object - The object to remove.
 * @param {Object} req.file - The uploaded file.
 * @param {Buffer} req.file.image - The image buffer.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const removeObject = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { plan, free_usage } = req;

    if (!req.file) {
      throw new BadRequestError("No image uploaded");
    }

    // * create base64 string from buffer
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Access object from form data
    const object = req.body.object;
    if (!object) {
      throw new BadRequestError("Object description is required");
    }

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage, premiumOnly: true });

    const creation = await aiService.removeObject({
      userId,
      object,
      image: base64Image,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.removeObject:", error);
    next(error);
  }
};

/**
 * Reviews a resume and provides feedback.
 * @param {Object} req - The request object.
 * @param {Object} req.file - The uploaded file.
 * @param {Buffer} req.file.resume - The resume buffer.
 * @param {Object} req.plan - The user's plan details.
 * @param {Object} req.free_usage - The user's free usage details.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const resumeReview = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { plan, free_usage } = req;

    if (!req.file) {
      throw new BadRequestError("No resume uploaded");
    }

    // * create base64 string from buffer
    const base64File = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // * check for usage limits
    clerkPlanCheck({ plan, free_usage, premiumOnly: true });

    const creation = await aiService.resumeReview({
      userId,
      resume: base64File,
      fileType: req.file.mimetype,
    });

    // * increase the credit usage for free users
    await increaseClerkCreditUsage({ userId, plan, free_usage });

    res.status(200).json({
      success: true,
      content: creation.content,
    });
  } catch (error) {
    console.error("Error in ai-controller.resumeReview:", error);
    next(error);
  }
};
