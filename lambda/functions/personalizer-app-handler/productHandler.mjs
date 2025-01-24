import { buildResponse } from "/opt/nodejs/helper.mjs";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PRODUCT_TABLE_NAME;

// return id
export const createProduct = async (body) => {
  body.id = uuidv4();
  console.log("🔥 body", body);
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: body,
    });
    const result = await docClient.send(command);
    console.log("🔥 result", result);
    return buildResponse(200, { message: "Product Created", id: body.id });
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    return buildResponse(500, { message: error.message });
  }
};
