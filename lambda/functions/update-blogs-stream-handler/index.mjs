import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  validateBlogId,
  dynamoHelper,
  strapiHelper,
  buildResponse,
} from "/opt/nodejs/helper.mjs";

const dynamoClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const BLOGS_TABLE = process.env.BLOGS_TABLE;
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export const handler = async (event) => {
  console.log(
    "🔥 DynamoDB Stream event received for blogs rating:",
    JSON.stringify(event, null, 2)
  );

  try {
    for (const record of event.Records) {
      await processStreamRecord(record);
    }

    return buildResponse(200, {
      body: JSON.stringify({
        message: "Stream records processed successfully",
        processedRecords: event.Records.length,
      }),
    });
  } catch (error) {
    console.error("❌ Error processing stream records:", error);
    return buildResponse(500, {
      body: JSON.stringify({
        error: "Internal server error processing stream records",
        details: error.message,
        processedRecords: event.Records?.length || 0,
      }),
    });
  }
};

const processStreamRecord = async (record) => {
  const blogId = record.dynamodb?.Keys?.blogId?.S;
  const customerId = record.dynamodb?.Keys?.customerId?.S;

  console.log(
    `📝 Processing record: ${record.eventName} for blogId: ${blogId}, customerId: ${customerId}`
  );

  // Only process INSERT and MODIFY events
  if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
    console.log(`⏭️ Skipping ${record.eventName} event`);
    return;
  }

  try {
    // Validate blog ID
    if (!blogId) {
      console.log("❌ Missing blogId in stream record");
      return;
    }

    const validation = validateBlogId(blogId);
    if (!validation.isValid) {
      console.log(`❌ Invalid blogId: ${validation.error}`);
      return;
    }

    const oldImage = record.dynamodb.OldImage;
    const newImage = record.dynamodb.NewImage;

    let shouldRecalculate = false;

    if (record.eventName === "INSERT") {
      shouldRecalculate = true;
    } else if (record.eventName === "MODIFY") {
      const oldRating = parseFloat(oldImage?.rating?.N || "0");
      const newRating = parseFloat(newImage?.rating?.N || "0");

      if (oldRating === newRating) {
        return;
      }

      shouldRecalculate = true;
    }

    if (!shouldRecalculate) {
      return;
    }

    // Calculate the new average rating using mathematical approach
    const newAverageRating = await calculateNewRatingData(blogId, record);

    // Update the blogs table with new average
    await updateBlogRatings(blogId, newAverageRating);

    // Update Strapi if configured
    if (STRAPI_URL && STRAPI_TOKEN) {
      await strapiHelper.updateBlogRating(
        STRAPI_URL,
        STRAPI_TOKEN,
        blogId,
        newAverageRating.avg_rating
      );
      console.log(`📤 Updated Strapi for blog ${blogId}`);
    } else {
      console.log("⚠️ Strapi configuration missing, skipping update");
    }

    console.log(
      `✅ Successfully processed ${record.eventName} for blog ${blogId}`
    );
  } catch (error) {
    console.error(`❌ Error processing record for blog ${blogId}:`, error);
  }
};

const calculateNewRatingData = async (blogId, record) => {
  try {
    // Get current blog data (avg_rating and total_no_of_ratings)
    const currentBlogData = await getBlogData(blogId);
    if (!currentBlogData) {
      throw new Error(`Blog with ID ${blogId} not found`);
    }

    const currentAvg = currentBlogData.avg_rating || 0;
    const currentCount = currentBlogData.total_no_of_ratings || 0;

    let newAverage;
    let newCount;

    if (record.eventName === "INSERT") {
      // INSERT case: new rating added
      const newRating = parseFloat(record.dynamodb.NewImage?.rating?.N || "0");

      if (currentCount === 0) {
        // First rating for this blog
        newAverage = newRating;
        newCount = 1;
      } else {
        // Formula: (currentAvg * currentCount + newRating) / (currentCount + 1)
        const totalPoints = currentAvg * currentCount;
        const newTotalPoints = totalPoints + newRating;
        newCount = currentCount + 1;
        newAverage = newTotalPoints / newCount;
      }
    } else if (record.eventName === "MODIFY") {
      // MODIFY case: rating updated
      const oldRating = parseFloat(record.dynamodb.OldImage?.rating?.N || "0");
      const newRating = parseFloat(record.dynamodb.NewImage?.rating?.N || "0");

      if (currentCount === 0) {
        // Edge case: somehow no ratings exist
        newAverage = newRating;
        newCount = 1;
      } else if (currentCount === 1) {
        // Only one rating exists, replace it
        newAverage = newRating;
        newCount = 1;
      } else {
        // Formula: (currentAvg * currentCount - oldRating + newRating) / currentCount
        const totalPoints = currentAvg * currentCount;
        const newTotalPoints = totalPoints - oldRating + newRating;
        newAverage = newTotalPoints / currentCount;
        newCount = currentCount; // Count stays same for updates
      }
    }

    // Round to 2 decimal places
    newAverage = Math.round(newAverage * 100) / 100;

    console.log(
      `📊 Final calculation - New Average: ${newAverage}, New Count: ${newCount}`
    );

    return {
      total_no_of_ratings: newCount,
      avg_rating: newAverage,
    };
  } catch (error) {
    console.error(
      `❌ Error calculating new rating data for blog ${blogId}:`,
      error
    );
    throw error;
  }
};

const getBlogData = async (blogId) => {
  try {
    const command = new GetCommand({
      TableName: BLOGS_TABLE,
      Key: { blogId },
    });
    const response = await dynamodb.send(command);
    return response.Item || null;
  } catch (error) {
    console.error("Error getting blog data:", error);
    throw error;
  }
};

const updateBlogRatings = async (blogId, newRatingData) => {
  try {
    const updates = {
      total_no_of_ratings: newRatingData.total_no_of_ratings,
      avg_rating: newRatingData.avg_rating,
      updatedAt: new Date().toISOString(),
    };

    const updateExpression = dynamoHelper.buildUpdateExpression(updates);
    const command = new UpdateCommand({
      TableName: BLOGS_TABLE,
      Key: { blogId },
      ...updateExpression,
    });

    await dynamodb.send(command);
    console.log(`✅ Successfully updated blog ratings for ${blogId}`);
  } catch (error) {
    console.error(`❌ Error updating blog ratings for ${blogId}:`, error);
    throw error;
  }
};
