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
import { fetchShopifyGql } from "/opt/nodejs/fetchShopifyGQL/index.mjs";

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PRODUCT_TABLE_NAME;

// return id
export const createProduct = async (body) => {
  console.log("🔥 body", body);
  if (!body.id) {
    body.id = uuidv4();
  }
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

export const getProduct = async (id) => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await docClient.send(command);

    if (!result.Item) {
      return buildResponse(404, { message: "Product not found" });
    }

    return buildResponse(200, {
      message: "Product Retrieved",
      data: result.Item,
    });
  } catch (error) {
    console.error("❌ Error in getProduct:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const updateProduct = async (id, body) => {
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
      message: "Product Updated",
      data: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const getAllProducts = async () => {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return buildResponse(200, { message: "No products found" });
    }

    return buildResponse(200, {
      message: "Products Retrieved",
      data: result.Items,
    });
  } catch (error) {
    console.error("❌ Error in getAllProducts:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const deleteProduct = async (id) => {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id },
      ReturnValues: "ALL_OLD",
    });

    const result = await docClient.send(command);

    if (!result.Attributes) {
      return buildResponse(404, { message: "Product not found" });
    }

    return buildResponse(200, {
      message: "Product Deleted",
      data: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const changeProductStatus = async (id, status) => {
  try {
    // Validate status
    if (!["active", "draft"].includes(status)) {
      return buildResponse(400, {
        message: "Invalid status. Must be either 'active' or 'draft'",
      });
    }

    // First get the product to get the Shopify ID
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { id },
    });

    const result = await docClient.send(getCommand);
    if (!result.Item) {
      return buildResponse(404, { message: "Product not found" });
    }

    // Update DynamoDB status
    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    });

    const updateResult = await docClient.send(updateCommand);

    // Update Shopify product tags
    const getTagsQuery = `
      query($id: ID!) {
        product(id: $id) {
          id
          tags
        }
      }
    `;

    const updateTagsMutation = `
      mutation($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Get current tags
    const {
      data: {
        data: { product },
      },
    } = await fetchShopifyGql(
      process.env.SHOPIFY_STORE_NAME,
      getTagsQuery,
      process.env.SHOPIFY_ADMIN_TOKEN,
      { id: `gid://shopify/Product/${id}` }
    );

    let currentTags = product.tags || [];
    let newTags = [...currentTags];

    if (status === "active") {
      // Add personalized tag if not present
      if (!currentTags.includes("personalized")) {
        newTags.push("personalized");
      }
    } else {
      // Remove personalized tag for draft status
      newTags = currentTags.filter((tag) => tag !== "personalized");
    }

    // Only update if tags have changed
    if (!arraysEqual(currentTags, newTags)) {
      const updateResponse = await fetchShopifyGql(
        process.env.SHOPIFY_STORE_NAME,
        updateTagsMutation,
        process.env.SHOPIFY_ADMIN_TOKEN,
        {
          input: {
            id: `gid://shopify/Product/${id}`,
            tags: newTags,
          },
        }
      );

      if (updateResponse.data.data.productUpdate.userErrors.length > 0) {
        const error = updateResponse.data.data.productUpdate.userErrors[0];
        throw new Error(`Shopify Error: ${error.message}`);
      }
    }

    return buildResponse(200, {
      message: "Product status updated successfully",
      data: {
        ...updateResult.Attributes,
        shopifyTags: newTags,
      },
    });
  } catch (error) {
    console.error("❌ Error in changeProductStatus:", error);
    return buildResponse(500, { message: error.message });
  }
};

// Helper function to compare arrays
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};
