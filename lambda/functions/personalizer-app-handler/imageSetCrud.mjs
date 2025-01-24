import { buildResponse } from "/opt/nodejs/helper.mjs";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// Use AWS_REGION environment variable which is automatically set in Lambda
const client = new DynamoDBClient({}); // Remove hardcoded region
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.IMAGE_SET_TABLE_NAME;

// return id
export const createImageSet = async (body) => {
  body.id = uuidv4();
  console.log("🔥 body", body);
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: body,
    });
    const result = await docClient.send(command);
    console.log("🔥 result", result);
    return buildResponse(200, { message: "Image Set Created", id: body.id });
  } catch (error) {
    console.error("❌ Error in createImageSet:", error);
    return buildResponse(500, { message: error.message });
  }
};

// return sets
export const fetchImageSets = async () => {
  try {
    const command = new ScanCommand({
      TableName: tableName, // Replace with your actual table name
    });

    const result = await docClient.send(command);

    // Check if Items exist
    if (!result.Items || result.Items.length === 0) {
      return buildResponse(200, { message: "No data found" });
    }

    return buildResponse(200, {
      message: "Images set returned",
      data: result.Items,
    }); // Return the array of items
  } catch (error) {
    console.error("❌ Error in fetchImageSets:", error);
    throw new Error("Failed to fetch image sets");
  }
};

// return body
export const fetchImageSet = async (id) => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await docClient.send(command);
    // Check if an item was found
    if (!result.Item) {
      return buildResponse(404, { message: "Image Set not found" });
    }

    // Return the fetched item
    return buildResponse(200, {
      message: "Image Set Fetched",
      data: result.Item,
    });
  } catch (error) {
    console.error("❌ Error in fetchImageSet:", error);
    return buildResponse(500, { message: error.message });
  }
};

// update and return required fields
export const updateImageSet = async (body, id) => {
  try {
    // Prepare the update expression and attribute values
    const updateExpression = Object.keys(body)
      .map((key) => `#${key} = :${key}`)
      .join(", ");
    const expressionAttributeNames = Object.keys(body).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {});
    const expressionAttributeValues = Object.keys(body).reduce((acc, key) => {
      acc[`:${key}`] = body[key];
      return acc;
    }, {});

    const command = new UpdateCommand({
      TableName: tableName,
      Key: { id }, // Specify the primary key to identify the item
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW", // Return the updated attributes
    });

    const result = await docClient.send(command);

    return buildResponse(200, {
      message: "Image Set Updated",
      updatedAttributes: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in updateImageSet:", error);
    return buildResponse(500, { message: error.message });
  }
};

// send Acknowledgement
export const deleteImageSet = async (id) => {
  try {
    console.log("🔥 id", id);
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await docClient.send(command);
    return buildResponse(200, { message: "Image Set Deleted" });
  } catch (error) {
    console.error("❌ Error in deleteImageSet:", error);
    return buildResponse(500, { message: error.message });
  }
};
