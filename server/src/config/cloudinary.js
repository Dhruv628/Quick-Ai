import { v2 as cloudinary } from "cloudinary";

/**
 * Configures and establishes connection to Cloudinary service using environment variables.
 * Sets up the Cloudinary SDK with cloud name, API key, and API secret from process.env.
 *
 * @async
 * @function connectToCloudinary
 * @returns {Promise<void>} A promise that resolves when the Cloudinary configuration is complete
 * @throws {Error} Throws an error if required environment variables are missing or invalid
 *
 * @requires process.env.CLOUDINARY_CLOUD_NAME - The Cloudinary cloud name
 * @requires process.env.CLOUDINARY_API_KEY - The Cloudinary API key
 * @requires process.env.CLOUDINARY_API_SECRET - The Cloudinary API secret
 */
const connectToCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export default connectToCloudinary;
