import OpenAI from "openai";
import axios from "axios";
import z from "zod";
import { v2 as cloudinary } from "cloudinary";
import BadRequestError from "../../utils/errors/bad-request-error.js";
import { prisma } from "../../config/database.js";
import {
  AI_PROMPT_CONTEXT,
  CREATION_TYPE,
} from "../../utils/constants/constants.js";

// * init the aiClient
const aiClient = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

const articleSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  prompt: z.string().min(1, "prompt is required"),
});
/**
 * Generates an AI-powered article based on user input and saves it to the database
 * @async
 * @function generateArticle
 * @param {Object} params - The parameters for article generation
 * @param {string} params.userId - The ID of the user requesting the article
 * @param {string} params.prompt - The prompt/topic for the article generation
 * @param {number} params.length - The maximum number of tokens for the generated article
 * @returns {Promise<Object>} The created article object with content
 * @throws {Error} Throws error if validation fails, AI service fails, or database operation fails
 * @description This function validates input parameters, calls the AI service to generate article content,
 * and stores the result in the database as a creation record of type ARTICLE
 */
export const generateArticle = async ({ userId, prompt, length }) => {
  try {
    articleSchema.parse({ userId, prompt, length }); // *validate input

    const response = await aiClient.chat.completions.create({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: AI_PROMPT_CONTEXT.GENERATE_ARTICLE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });
    const content = response.choices[0].message.content;

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        prompt,
        content,
        type: CREATION_TYPE.GENERATE_ARTICLE,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return creation;
  } catch (error) {
    console.error("Error in ai-service.generateArticle : ", error);
    throw error;
  }
};

const blogTitleSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  prompt: z.string().min(1, "keyword is required"),
  category: z.string().min(1, "category is required"),
});
/**
 * Generates blog titles using AI based on provided keyword and category
 * @async
 * @function generateBlogTitles
 * @param {Object} params - The parameters object
 * @param {string} params.userId - The ID of the user requesting blog titles
 * @param {string} params.keyword - The keyword to generate blog titles for
 * @param {string} params.category - The category for the blog titles
 * @returns {Promise<Object>} Promise that resolves to an object containing the generated content
 * @returns {string} returns.content - The generated blog titles content
 * @throws {Error} Throws validation error if input parameters are invalid
 * @throws {BadRequestError} Throws error if creation fails to save to database
 * @throws {Error} Throws any other errors that occur during AI generation or database operations
 */
export const generateBlogTitles = async ({ userId, prompt, category }) => {
  try {
    blogTitleSchema.parse({ userId, prompt, category }); // *validate input

    const aiServicePrompt = `Generate 5 blog titles for the keyword :"${prompt}", in the category :"${category}".`;

    const response = await aiClient.chat.completions.create({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: AI_PROMPT_CONTEXT.GENERATE_BLOG_TITLES,
        },
        { role: "user", content: aiServicePrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    const content = response.choices[0].message.content;

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        prompt: aiServicePrompt,
        content,
        type: CREATION_TYPE.GENERATE_BLOG_TITLE,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return { content: creation.content };
  } catch (error) {
    console.error("Error in ai-service.generateBlogTitles : ", error);
    throw error;
  }
};

const imageSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  prompt: z.string().min(1, "prompt is required"),
  style: z.string().min(1, "style is required"),
  publish: z.boolean().default(false),
});
/**
 * Generates an image using AI and saves the creation to the database
 * @async
 * @function generateImage
 * @param {Object} params - The parameters for image generation
 * @param {string} params.userId - The ID of the user requesting the image
 * @param {string} params.prompt - The text prompt for image generation
 * @param {string} params.style - The style for image generation
 * @param {boolean} params.publish - Whether the creation should be published
 * @returns {Promise<Object>} The created database record containing the generated image data
 * @throws {ValidationError} When input validation fails
 * @throws {BadRequestError} When creation fails to save to database
 * @throws {Error} When AI service or database operations fail
 */
export const generateImage = async ({
  userId,
  prompt,
  style,
  publish = false,
}) => {
  try {
    imageSchema.parse({ userId, prompt, style, publish }); // * validate input

    const aiServicePrompt = `Create an image based on the following prompt: "${prompt}". The style of the generated image should be "${style}" style.`;

    const form = new FormData();
    form.append("prompt", aiServicePrompt);

    // * clipdrop image generation api
    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    // * convert binary data to base64 for database storage
    const base64 = Buffer.from(response.data).toString("base64");
    const base64Image = `data:image/png;base64,${base64}`;

    // * upload the image to cloudinary
    const { secure_url: content } = await cloudinary.uploader.upload(
      base64Image
    );

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        prompt: aiServicePrompt,
        content,
        type: CREATION_TYPE.GENERATE_IMAGE,
        publish,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return creation;
  } catch (error) {
    console.error("Error in ai-service.generateImage : ", error);
    throw error;
  }
};
const removeBackgroundSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  image: z.string().min(1, "image is required"),
});
/**
 * Removes the background from an image using Cloudinary's AI-powered background removal
 * and saves the result to the database.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.userId - The ID of the user making the request
 * @param {Object} params.image - The image file to process
 * @param {number} params.image.size - Size of the image file in bytes
 *
 * @throws {BadRequestError} When image size exceeds 5MB
 * @throws {BadRequestError} When creation fails to save to database
 * @throws {Error} When input validation fails or other errors occur
 *
 * @returns {Promise<Object>} The created database record containing the processed image
 */
export const removeBackground = async ({ userId, image }) => {
  try {
    removeBackgroundSchema.parse({ userId, image }); // * validate input

    // * upload image to Cloudinary
    const { secure_url: content } = await cloudinary.uploader.upload(image, {
      transformation: [{ effect: "background_removal" }],
    });

    console.info("Uploaded image URL:", content);

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        content,
        type: CREATION_TYPE.REMOVE_BACKGROUND,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return creation;
  } catch (error) {
    console.error("Error in ai-service.removeObject : ", error);
    throw error;
  }
};

const removeObjectSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  image: z.string().min(1, "image is required"),
  object: z.string().min(1, "object description is required"),
});
/**
 * Removes a specified object from an image by uploading the image to Cloudinary with a removal transformation,
 * generating a transformed image URL, and persisting a creation record to the database.
 *
 * The function validates input using `removeObjectSchema`, uploads the provided image file to Cloudinary,
 * constructs a Cloudinary URL with the `gen_remove` effect for the requested object, and saves a creation entry
 * (with type `CREATION_TYPE.REMOVE_OBJECT`) in the database via Prisma.
 *
 * @async
 * @function removeObject
 * @param {Object} params - Parameters object.
 * @param {string|number} params.userId - Identifier of the user performing the request.
 * @param {string} params.object - Description/name of the object to remove from the image (used as the prompt).
 * @param {Object} params.image - Image file descriptor to be uploaded.
 * @param {string} params.image.path - Filesystem path to the image to upload to Cloudinary.
 * @returns {Promise<Object>} The created creation record saved to the database.
 * @throws {ZodError} If input validation via `removeObjectSchema` fails.
 * @throws {Error} If Cloudinary upload/transformation fails or saving to the database fails.
 * @throws {BadRequestError} If the creation record is not returned/created (falsy creation).
 */
export const removeObject = async ({ userId, object, image }) => {
  try {
    removeObjectSchema.parse({ userId, object, image }); // * validate input

    // * upload image to Cloudinary with object removal transformation
    const { secure_url: content } = await cloudinary.uploader.upload(image, {
      resource_type: "image",
      transformation: [{ effect: `gen_remove:prompt_${object}` }],
    });

    console.info("Uploaded image URL:", content);

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        prompt: object,
        content,
        type: CREATION_TYPE.REMOVE_OBJECT,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return creation;
  } catch (error) {
    console.error("Error in ai-service.removeObject : ", error);
    throw error;
  }
};

const reviewResumeSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  resume: z.string().min(1, "resume is required"),
  fileType: z.string().optional(), // optional file type override
});
/**
 * Reviews a user's resume using an external AI service and persists the result.
 *
 * Workflow:
 * 1. Validates input via `reviewResumeSchema`.
 * 2. Uploads the resume file to Cloudinary (uses `resume.path`) and receives an upload identifier/URL.
 * 3. Sends the resume file URL and a review prompt to the AI via `aiClient.chat.completions.create`
 *    (model: "sonar-pro", temperature: 0.7, max_tokens: 8000) and reads the AI's markdown-formatted response.
 * 4. Persists a creation record to the database via `prisma.creation.create` with the AI response and file URL.
 * 5. Returns the created database record.
 *
 * @async
 * @param {Object} params - Function parameters (destructured).
 * @param {string} params.userId - ID of the user requesting the resume review.
 * @param {Object} params.resume - Resume file descriptor.
 * @param {string} params.resume.path - Local filesystem path (or stream path) to the resume file to upload.
 *
 * @returns {Promise<Object>} The persisted creation record containing fields such as userId, prompt,
 *                            content (AI feedback), fileUrl, and type.
 *
 * @throws {Error} ValidationError if input validation fails (from `reviewResumeSchema`).
 * @throws {Error} UploadError if Cloudinary upload fails.
 * @throws {Error} AIClientError if the AI completion request fails or returns an unexpected shape.
 * @throws {Error} DatabaseError if persisting the creation to the database fails (including a thrown
 *                  BadRequestError when creation is not returned).
 *
 * @example
 * usage
 * await resumeReview({ userId: 'user_123', resume: { path: '/tmp/resume.pdf' } });
 */
export const resumeReview = async ({ userId, resume, fileType }) => {
  try {
    reviewResumeSchema.parse({ userId, resume, fileType }); // * validate input

    // * upload resume to Cloudinary
    const { secure_url: fileUrl } = await cloudinary.uploader.upload(resume, {
      resource_type: "auto", // * automatically detect file type
      format: fileType,
    });

    const response = await aiClient.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: AI_PROMPT_CONTEXT.REVIEW_RESUME,
            },
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 8000, // * increased for detailed HTML-friendly response
    });

    // * get the markdown-formatted response
    const content = response.choices[0].message.content;

    console.log("feedback--", content, "--feedback");

    // * save the data in the db
    const creation = await prisma.creation.create({
      data: {
        userId,
        prompt: "Resume Review",
        content,
        fileUrl,
        type: CREATION_TYPE.REVIEW_RESUME,
      },
    });

    console.log("Creation saved to DB:", creation);

    if (!creation) {
      throw new BadRequestError("Failed to add creation to the db");
    }
    return creation;
  } catch (error) {
    console.error("Error in ai-service.resumeReview : ", error);
    throw error;
  }
};
