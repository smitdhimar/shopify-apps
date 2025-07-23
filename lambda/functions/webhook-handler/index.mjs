import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { buildResponse, validateBlogId } from "/opt/nodejs/helper.mjs";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const BLOGS_TABLE = process.env.BLOGS_TABLE;

export const handler = async (event) => {
  console.log("🚀 Webhook received:", JSON.stringify(event.body, null, 2));

  try {
    const body = JSON.parse(event.body || "{}");

    // Validate Strapi webhook payload
    if (!body.entry || !body.entry.documentId || !body.model) {
      return buildResponse(400, {
        error:
          "Invalid webhook payload. Missing entry, entry.documentId, or model",
      });
    }

    // Check if the model is "blogs" - only process blog entries
    if (body.model !== "blog") {
      console.log(`📝 Skipping non-blog model: ${body.model}`);
      return buildResponse(200, {
        message: `Webhook received for model '${body.model}' but only 'blogs' model is processed`,
        model: body.model,
        skipped: true,
      });
    }

    const blogId = body.entry.documentId;

    // Validate blog ID
    const validation = validateBlogId(blogId);
    if (!validation.isValid) {
      return buildResponse(400, { error: validation.error });
    }

    // Create new blog entry
    const createResult = await createBlogEntry(body);

    // Check if creation failed
    if (!createResult.success) {
      console.error(`❌ Failed to create blog entry: ${createResult.error}`);
      return buildResponse(createResult.statusCode, {
        error: createResult.error,
        blogId: blogId,
        details: createResult.details,
      });
    }

    return buildResponse(200, {
      message: "Blog entry created successfully",
      blogId: blogId,
    });
  } catch (error) {
    return buildResponse(500, {
      error: "Internal server error processing webhook",
      details: error.message,
    });
  }
};

const createBlogEntry = async (payload) => {
  const blogId = payload.entry.documentId;

  try {
    const blogEntry = {
      blogId: blogId,
      createdAt: payload.entry.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avg_rating: 0,
      total_no_of_ratings: 0,
    };

    const command = new PutCommand({
      TableName: BLOGS_TABLE,
      Item: blogEntry,
      ConditionExpression: "attribute_not_exists(blogId)", // prevents duplicate entries.
    });

    await dynamodb.send(command);
    console.log(`✅ Blog entry created: ${blogId}`);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500, // Internal Server Error
      error: "Failed to create blog entry",
      details: error.message || "Unknown database error",
    };
  }
};
