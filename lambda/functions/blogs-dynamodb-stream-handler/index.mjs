import { buildResponse, strapiHelper } from "/opt/nodejs/helper.mjs";

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export const handler = async (event) => {
  console.log(
    "🔥 DynamoDB Stream event received:",
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
  console.log(
    `📝 Processing record: ${record.eventName} for blogId: ${record.dynamodb?.Keys?.blogId?.S}`
  );

  if (record.eventName !== "MODIFY") {
    console.log(`⏭️ Skipping ${record.eventName} event`);
    return;
  }

  try {
    const oldImage = record.dynamodb.OldImage;
    const newImage = record.dynamodb.NewImage;

    const oldRating = parseFloat(oldImage?.avg_rating?.N || "0");
    const newRating = parseFloat(newImage?.avg_rating?.N || "0");
    const oldTotalRatings = parseInt(oldImage?.total_no_of_ratings?.N || "0");
    const newTotalRatings = parseInt(newImage?.total_no_of_ratings?.N || "0");

    if (oldRating === newRating && oldTotalRatings === newTotalRatings) {
      return;
    }

    const blogId = newImage.blogId.S;

    if (STRAPI_URL && STRAPI_API_TOKEN) {
      await strapiHelper.updateBlogRating(
        STRAPI_URL,
        STRAPI_API_TOKEN,
        blogId,
        newRating
      );
      console.log(`✅ Successfully updated Strapi for blog ${blogId}`);
    } else {
      console.log("⚠️ Strapi configuration missing, skipping update");
    }
  } catch (error) {
    const blogId = record.dynamodb?.Keys?.blogId?.S || "unknown";
    console.error(`❌ Error processing record for blog ${blogId}:`, error);
  }
};
