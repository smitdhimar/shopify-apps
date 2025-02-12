import { buildResponse } from "/opt/nodejs/helper.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PERSONALIZED_ORDERS_TABLE;

export const checkOrderPersonalization = async (order) => {
  try {
    const isPersonalized = order.line_items.some((item) =>
      item.properties.some(
        (property) =>
          property.name === "devx-personalized" && property.value === "true"
      )
    );

    // If order is personalized, store it in DynamoDB
    if (isPersonalized) {
      const lineItems = order.line_items.filter((item) =>
        item.properties.some(
          (property) =>
            property.name === "devx-personalized" && property.value === "true"
        )
      );

      const personalizedOrderItems = lineItems.map((item) => ({
        orderId: order.id.toString(),
        createdAt: order.created_at,
        status: order.status,
        billingAddress: order?.billing_address,
        shippingAddress: order?.shipping_address,
        defaultAddress: order?.default_address,
        id: item.id.toString(),
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        title: item.title,
        price: item.price,
        currency: order.currency,
        variantTitle: item.variant_title,
        productName: item.name,
        totalPrice: item.total_price,
        customerDetails: order.customer,
        createdAt: new Date().toISOString(),
        properties: item.properties.reduce((acc, property) => {
          acc[property.name] = property.value;
          return acc;
        }, {}),
      }));

      // Prepare items for batch write
      const writeRequests = personalizedOrderItems.map((item) => ({
        PutRequest: {
          Item: item,
        },
      }));

      // DynamoDB BatchWrite can only handle 25 items at a time
      for (let i = 0; i < writeRequests.length; i += 25) {
        const batch = writeRequests.slice(i, i + 25);
        const command = new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch,
          },
        });

        const response = await docClient.send(command);

        // Handle unprocessed items if any
        if (
          response.UnprocessedItems &&
          Object.keys(response.UnprocessedItems).length > 0
        ) {
          console.warn(
            "⚠️ Some items were not processed:",
            response.UnprocessedItems
          );
          // You might want to implement retry logic here
        }
      }

      console.log(
        `✅ Saved ${personalizedOrderItems.length} personalized items for order:`,
        order.name
      );
    }

    return buildResponse(200, {
      message: "Order personalization status checked",
      data: {
        orderId: order.id,
        orderName: order.name,
        isPersonalized: isPersonalized,
        lineItems: order.line_items.map((item) => ({
          id: item.id,
          title: item.title,
          isPersonalized: item.properties.some(
            (prop) =>
              prop.name === "engraving" && prop.value === "Happy Birthday!"
          ),
          properties: item.properties,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error checking order personalization:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const getOrders = async (queryParams) => {
  try {
    console.log("🔥 Query Params received:", queryParams);

    const {
      startDate,
      endDate,
      searchTerm,
      cursor,
      pageSize = "20", // Default to 20 items
    } = queryParams || {};

    // Base scan parameters
    const scanParams = {
      TableName: tableName,
      Limit: parseInt(pageSize),
    };

    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    // Add cursor-based pagination
    if (cursor && cursor !== "undefined" && cursor !== "null") {
      try {
        // Decode the cursor if it's base64
        let decodedCursor;
        try {
          decodedCursor = Buffer.from(cursor, "base64").toString("utf-8");
        } catch (e) {
          console.error("❌ Base64 decode error:", e);
          return buildResponse(400, { message: "Invalid cursor format" });
        }

        // Parse the JSON
        try {
          const parsedCursor = JSON.parse(decodedCursor);
          if (parsedCursor && parsedCursor.orderId && parsedCursor.id) {
            scanParams.ExclusiveStartKey = parsedCursor;
          } else {
            throw new Error("Invalid cursor structure");
          }
        } catch (e) {
          console.error("❌ JSON parse error:", e);
          return buildResponse(400, { message: "Invalid cursor data" });
        }
      } catch (error) {
        console.error("❌ Cursor processing error:", error);
        return buildResponse(400, {
          message: "Invalid cursor provided",
          error: error.message,
        });
      }
    }

    // Add date filter if dates are provided
    if (startDate) {
      filterExpressions.push("#createdAt >= :startDate");
      expressionAttributeValues[":startDate"] = new Date(startDate).toISOString();
      expressionAttributeNames["#createdAt"] = "createdAt";
    }

    if (endDate) {
      filterExpressions.push("#createdAt <= :endDate");
      expressionAttributeValues[":endDate"] = new Date(endDate).toISOString();
      expressionAttributeNames["#createdAt"] = "createdAt";
    }

    // Add search filter if searchTerm is provided
    if (searchTerm) {
      filterExpressions.push(
        "(contains(#email, :searchTerm) OR " +
          "contains(#first_name, :searchTerm) OR " +
          "contains(#last_name, :searchTerm))"
      );
      expressionAttributeValues[":searchTerm"] = searchTerm.toLowerCase();
      expressionAttributeNames["#email"] = "customerDetails.email";
      expressionAttributeNames["#first_name"] =
        "customerDetails.firstName";
      expressionAttributeNames["#last_name"] =
        "customerDetails.lastName";
    }

    // Combine all filter expressions
    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(" AND ");
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    console.log("🔥 Scan Params:", JSON.stringify(scanParams, null, 2));

    const command = new ScanCommand(scanParams);
    const result = await docClient.send(command);

    console.log("🔥 DynamoDB Result:", JSON.stringify(result, null, 2));

    // Check if Items exist
    if (!result.Items || result.Items.length === 0) {
      return buildResponse(200, {
        message: "No data found",
        data: [],
        pagination: {
          nextCursor: null,
          hasMore: false,
        },
      });
    }

    // Create base64 cursor for next page
    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return buildResponse(200, {
      message: "Orders returned",
      data: result.Items,
      pagination: {
        nextCursor,
        hasMore: !!result.LastEvaluatedKey,
        total: result.Items.length,
        scannedCount: result.ScannedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in fetching orders:", error);
    return buildResponse(500, { message: error.message });
  }
};
