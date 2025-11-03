import z from "zod";
import BadRequestError from "../../utils/errors/bad-request-error.js";
import { getPrismaClient } from "../../config/database.js";

const userCreationsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});
/**
 * Retrieves all creations associated with a specific user
 *
 * @async
 * @param {Object} params - The parameters object
 * @param {string} params.userId - The ID of the user whose creations to fetch
 * @param {Object} [params.options] - Optional query options (select, orderBy, pagination)
 * @returns {Promise<Array>} Array of creation objects associated with the user
 * @throws {Error} When validation fails or database operation fails
 */
export const getUserCreations = async ({ userId, options = {} }) => {
  try {
    userCreationsSchema.parse({ userId }); // * validate input

    const { select, orderBy, skip, take } = options;
    const prisma = getPrismaClient(); // * get prisma client safely

    const creations = await prisma.creation.findMany({
      where: {
        userId,
      },
      select: select || undefined, // * only select specific fields if provided
      orderBy: orderBy || { createdAt: "desc" }, // * default to newest first
      skip,
      take,
    });

    return creations;
  } catch (error) {
    console.error("Error in user-service.getUserCreations:", error);
    throw error;
  }
};

const likeCreationSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  creationId: z.string().min(1, "creationId is required"),
});
/**
 * Adds a user's like to a specific creation
 *
 * @async
 * @param {Object} params - The parameters object
 * @param {string} params.userId - The ID of the user performing the like action
 * @param {string} params.creationId - The ID of the creation to be liked
 * @returns {Promise<Object>} The updated creation object or a message if already liked
 * @throws {BadRequestError} When creation is not found
 * @throws {Error} When validation fails or database operation fails
 */
export const likeCreation = async ({ userId, creationId }) => {
  try {
    likeCreationSchema.parse({ userId, creationId }); // * validate input

    creationId = parseInt(creationId); // * ensure creationId is an integer
    const prisma = getPrismaClient(); // * get prisma client safely

    // * use atomic operation with RETURNING clause to get updated data in single query
    const [updatedCreation] = await prisma.$queryRaw`
      UPDATE "creations" 
      SET "likes" = CASE 
        WHEN ${userId} = ANY("likes") THEN array_remove("likes", ${userId})
        ELSE array_append("likes", ${userId})
      END
      WHERE "id" = ${creationId}
      RETURNING *
    `;

    if (!updatedCreation) {
      throw new BadRequestError("Creation not found");
    }

    return updatedCreation;
  } catch (error) {
    console.error("Error in user-service.likeCreation:", error);
    throw error;
  }
};

/**
 * Retrieves all public creations from the database with pagination and optimized queries
 *
 * @async
 * @param {Object} [params] - Optional parameters
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=20] - Number of items per page
 * @param {Object} [params.select] - Specific fields to select
 * @param {Object} [params.orderBy] - Sorting options
 * @returns {Promise<Array>} Array of public creation objects
 * @throws {Error} When database operation fails
 */
export const getPublicCreations = async ({
  page = 1,
  limit = 20,
  select = null,
  orderBy = { createdAt: "desc" },
} = {}) => {
  try {
    const skip = (page - 1) * limit;
    const prisma = getPrismaClient(); // * get prisma client safely

    const creations = await prisma.creation.findMany({
      where: {
        publish: true,
      },
      select: select || {
        id: true,
        content: true,
        type: true,
        likes: true,
        createdAt: true,
        userId: true,
        prompt: true,
        // * exclude potentially large fields like prompt unless specifically requested
      },
      orderBy,
      skip,
      take: limit,
    });

    return creations;
  } catch (error) {
    console.error("Error in user-service.getPublicCreations:", error);
    throw error;
  }
};
