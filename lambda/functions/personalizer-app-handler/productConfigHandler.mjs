import { buildResponse } from "/opt/nodejs/helper.mjs";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PRODUCT_CONFIG_TABLE_NAME;

export const createProductConfig = async (body) => {
  body.id = uuidv4();
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: body,
    });
    await docClient.send(command);
    return buildResponse(200, {
      message: "Product Config Created",
      id: body.id,
    });
  } catch (error) {
    console.error("❌ Error in createProductConfig:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const getProductConfig = async (id) => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await docClient.send(command);

    if (!result.Item) {
      return buildResponse(404, { message: "Product Config not found" });
    }

    return buildResponse(200, {
      message: "Product Config Retrieved",
      data: result.Item,
    });
  } catch (error) {
    console.error("❌ Error in getProductConfig:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const getAllProductConfigs = async () => {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return buildResponse(200, { message: "No product configs found" });
    }

    return buildResponse(200, {
      message: "Product Configs Retrieved",
      data: result.Items,
    });
  } catch (error) {
    console.error("❌ Error in getAllProductConfigs:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const updateProductConfig = async (id, body) => {
  try {
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
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);
    return buildResponse(200, {
      message: "Product Config Updated",
      data: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in updateProductConfig:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const deleteProductConfig = async (id) => {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id },
      ReturnValues: "ALL_OLD",
    });

    const result = await docClient.send(command);

    if (!result.Attributes) {
      return buildResponse(404, { message: "Product Config not found" });
    }

    return buildResponse(200, {
      message: "Product Config Deleted",
      data: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in deleteProductConfig:", error);
    return buildResponse(500, { message: error.message });
  }
};
