/**
 * Error Handler Middleware
 * @createdAt 11-09-2024
 */
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import CustomError from "../../utils/errors/custom-error.js";

/**
 * This middleware handles all errors
 * @param {Error} error - The error object
 * @param {Request} _req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} _next - The next function
 * @returns { success : false, errors: [{ message: string, field?: string }] }
 */
function errorHandler(error, _req, res, _next) {
  console.error("Error Handler Middleware", error);

  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send({ success: false, errors: error.serializeErrors() });
  }

  // Handle JSON parsing errors from body-parser
  if (error.type === "entity.parse.failed" && error.status === 400) {
    return res.status(400).send({
      success: false,
      errors: [
        {
          message: "Invalid JSON format in request body",
          details:
            "Please check for trailing commas, missing quotes, or other JSON syntax errors",
          receivedBody:
            error.body?.substring(0, 200) +
            (error.body?.length > 200 ? "..." : ""), // Show first 200 chars
        },
      ],
    });
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      message: `${issue.path.join(", ")}: ${issue.message}`,
      path: issue.path.join(", "),
    }));

    return res.status(400).send({
      success: false,
      errors: formattedErrors,
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    const formattedErrors = [
      {
        message: error.message,
      },
    ];

    return res.status(400).send({
      success: false,
      errors: formattedErrors,
    });
  }

  return res.status(500).send({
    success: false,
    errors: [{ message: "Something went wrong" }],
  });
}

export default errorHandler;
