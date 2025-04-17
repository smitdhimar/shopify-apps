import { buildResponse } from "/opt/nodejs/helper.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PRODUCT_VARIANT_SIZE_TABLE_NAME;

export const getVariantsSizes = async (id) => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await docClient.send(command);

    if (!result.Item) {
      return buildResponse(404, { message: "Product sizes not found" });
    }

    return buildResponse(200, {
      message: "Product sizes Retrieved",
      data: result.Item,
    });
  } catch (error) {
    console.error("❌ Error in getVariantSizes:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const updateVariantSizes = async (id, body) => {
  try {
    const { id: _, ...bodyWithoutId } = body;

    const updateExpression = Object.keys(bodyWithoutId)
      .map((key) => `#${key} = :${key}`)
      .join(", ");
    
    const expressionAttributeNames = Object.keys(bodyWithoutId).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {});
    
    const expressionAttributeValues = Object.keys(bodyWithoutId).reduce((acc, key) => {
      acc[`:${key}`] = bodyWithoutId[key];
      return acc;
    }, {});
    
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);
    return buildResponse(200, {
      message: "Product Sizes Updated",
      data: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in updateProductSizes:", error);
    return buildResponse(500, { message: error.message });
  }
};

