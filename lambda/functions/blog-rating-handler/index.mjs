import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  buildResponse,
  validateRating,
  validateBlogId,
  validateCustomerId,
} from "/opt/nodejs/helper.mjs";

const dynamoClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

const RATINGS_TABLE = process.env.RATINGS_TABLE;

export const handler = async (event) => {
  console.log("🚀 Rating submission received:", JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || "{}");

    // Validate input
    const validation = validateRatingInput(body);
    if (!validation.isValid) {
      return buildResponse(400, { error: validation.error });
    }

    // Check if rating already exists and store/update accordingly
    const result = await upsertRating(body);

    if (!result.success) {
      console.error(`❌ Failed to upsert rating: ${result.error}`);
      return buildResponse(result.statusCode, {
        error: result.error,
        blogId: body.blogId,
        customerId: body.customerId,
        details: result.details,
      });
    }

    return buildResponse(200, {
      message: result.isUpdate
        ? "Rating updated successfully"
        : "Rating submitted successfully",
      action: result.isUpdate ? "updated" : "created",
      blogId: body.blogId,
      customerId: body.customerId,
      rating: body.rating,
      previousRating: result.previousRating,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error processing rating submission:", error);
    return buildResponse(500, {
      error: "Internal server error processing rating",
      details: error.message,
    });
  }
};

const validateRatingInput = (body) => {
  // Validate blog ID
  const blogValidation = validateBlogId(body.blogId);
  if (!blogValidation.isValid) {
    return blogValidation;
  }

  // Validate customer ID
  const customerValidation = validateCustomerId(body.customerId);
  if (!customerValidation.isValid) {
    return customerValidation;
  }

  // Validate rating
  const ratingValidation = validateRating(body.rating);
  if (!ratingValidation.isValid) {
    return ratingValidation;
  }

  return { isValid: true };
};

const upsertRating = async (ratingData) => {
  const { blogId, customerId, rating } = ratingData;
  const timestamp = new Date().toISOString();

  try {
    // First, check if rating already exists
    const existingRating = await getRatingIfExists(blogId, customerId);

    const ratingEntry = {
      blogId: blogId,
      customerId: customerId,
      rating: rating,
    };

    let isUpdate = false;
    let previousRating = null;

    if (existingRating) {
      // Update existing rating
      isUpdate = true;
      previousRating = existingRating.rating;
      ratingEntry.createdAt = existingRating.createdAt;
      ratingEntry.updatedAt = timestamp;
    } else {
      // Create new rating
      ratingEntry.createdAt = timestamp;
      ratingEntry.updatedAt = timestamp;
    }

    // Use PutCommand to allow both insert and update
    const command = new PutCommand({
      TableName: RATINGS_TABLE,
      Item: ratingEntry,
    });

    await dynamodb.send(command);
    return {
      success: true,
      isUpdate,
      previousRating,
    };
  } catch (error) {
    console.error(
      `❌ Error upserting rating for ${blogId}, ${customerId}:`,
      error
    );
    // Generic error fallback
    return {
      success: false,
      statusCode: 500,
      error: "Failed to process rating",
      details: error.message || "Unknown database error",
    };
  }
};

const getRatingIfExists = async (blogId, customerId) => {
  try {
    const command = new GetCommand({
      TableName: RATINGS_TABLE,
      Key: {
        blogId: blogId,
        customerId: customerId,
      },
    });

    const result = await dynamodb.send(command);
    return result.Item || null;
  } catch (error) {
    console.error("❌ Error checking existing rating:", error);
    return null;
  }
};
