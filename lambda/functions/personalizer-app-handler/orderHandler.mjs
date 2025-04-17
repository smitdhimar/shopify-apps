import { buildResponse } from "/opt/nodejs/helper.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PERSONALIZED_ORDERS_TABLE;

export const checkOrderPersonalization = async (order) => {
  try {
    console.log("🔥 Order received/updated/cancel-order:", JSON.stringify(order.id));
    const isPersonalized = order.line_items.some((item) =>
      item.properties.some(
        (property) =>
          (property.name === "Personalized" || property.name === 'devx-personalized') && property.value === "true"
      )
    );

    // If order is personalized, store it in DynamoDB
    if (isPersonalized) {
      const lineItems = order.line_items.filter((item) =>
        item.properties.some(
          (property) =>
            (property.name === "Personalized" || property.name === 'devx-personalized') && property.value === "true"
        )
      );


      const personalizedOrderItems = lineItems.map((item) => {
        const isRefunded = order.refunds && order.refunds.some(refund =>
          refund.refund_line_items && refund.refund_line_items.some(refundLineItem =>
            refundLineItem.line_item && refundLineItem.line_item.id === item.id
          )
        );
        return {
          orderId: order.id.toString(),
          __typename: "order",
          orderNumber: order?.order_number.toString(),
          cancelledAt: order?.cancelled_at || null,
          createdAt: order.created_at,
          paymentStatus: order.financial_status,
          fulfillmentStatus: item?.fulfillment_status,
          billingAddress: order?.billing_address,
          shippingAddress: order?.shipping_address,
          defaultAddress: order?.default_address,
          id: item.id.toString(),
          sku: item.sku,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          title: item.title,
          price: item.price,
          currency: order.currency,
          variantTitle: item.variant_title,
          productName: item.name,
          isRefunded,
          totalPrice: item.total_price,
          customerDetails: order.customer,
          properties: item.properties.reduce((acc, property) => {
            acc[property.name] = property.value;
            return acc;
          }, {}),
        }
      }
      );

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
        orderNumber: order?.order_number,
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

    const { startDate, endDate, cursor, pageSize = "20" } = queryParams || {};

    // Ensure the pageSize is a valid integer
    const limit = parseInt(pageSize, 10) || 20;

    // Base query parameters
    const queryParamsBase = {
      TableName: tableName,
      IndexName: "personalized-orders-index",
      Limit: limit,
      KeyConditionExpression: "#typename = :typename",
      ExpressionAttributeNames: {
        "#typename": "__typename",
      },
      ExpressionAttributeValues: {
        ":typename": "order",
      },
      ScanIndexForward: false,
    };

    // Handle cursor-based pagination
    if (cursor && cursor !== "undefined" && cursor !== "null") {
      try {
        const decodedCursor = Buffer.from(cursor, "base64").toString("utf-8");
        const parsedCursor = JSON.parse(decodedCursor);

        if (parsedCursor && parsedCursor.id && parsedCursor.createdAt) {
          queryParamsBase.ExclusiveStartKey = parsedCursor;
        } else {
          throw new Error("Invalid cursor structure");
        }
      } catch (error) {
        console.error("❌ Cursor processing error:", error);
        return buildResponse(400, {
          message: "Invalid cursor format",
          error: error.message,
        });
      }
    }

    // Add date filter using KeyConditionExpression if a Sort Key (e.g., createdAt) exists
    if (startDate || endDate) {
      let dateCondition = "";

      // Convert startDate and endDate to IST by adding 5 hours and 30 minutes
      const startIST = startDate
        ? new Date(
          new Date(startDate).setHours(0, 0, 0, 0) + 19800000
        ).toISOString() // Start of the day
        : null; // 5 hours 30 minutes in milliseconds
      const endIST = endDate
        ? new Date(
          new Date(endDate).setHours(23, 59, 59, 999) + 19800000
        ).toISOString() // End of the day
        : null;

      if (startIST && endIST) {
        dateCondition = "#sk BETWEEN :startDate AND :endDate";
        queryParamsBase.ExpressionAttributeValues[":startDate"] = startIST;
        queryParamsBase.ExpressionAttributeValues[":endDate"] = endIST;
      } else if (startIST) {
        dateCondition = "#sk >= :startDate";
        queryParamsBase.ExpressionAttributeValues[":startDate"] = startIST;
      } else if (endIST) {
        dateCondition = "#sk <= :endDate";
        queryParamsBase.ExpressionAttributeValues[":endDate"] = endIST;
      }

      queryParamsBase.KeyConditionExpression += ` AND ${dateCondition}`;
      queryParamsBase.ExpressionAttributeNames["#sk"] = "createdAt"; // Ensure this is your sort key
    }

    console.log("🔥 Query Params:", JSON.stringify(queryParamsBase, null, 2));

    // Execute the query
    const command = new QueryCommand(queryParamsBase);
    const result = await docClient.send(command);

    console.log("🔥 DynamoDB Result:", JSON.stringify(result, null, 2));

    // Check if items exist
    if (!result.Items || result.Items.length === 0) {
      return buildResponse(200, {
        message: "No data found",
        data: [],
        pagination: { nextCursor: null, hasMore: false },
      });
    }

    // Generate next cursor
    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return buildResponse(200, {
      message: "Orders returned successfully",
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

export const searchOrders = async (queryParams) => {
  try {
    console.log("🔥 Query Params received:", queryParams);

    const { searchTerm } = queryParams || {};

    if (!searchTerm) {
      return buildResponse(400, {
        message: "Search term is required",
      });
    }

    // Search by orderId
    const orderIdParams = {
      TableName: tableName,
      IndexName: "search-order-index",
      Limit: 20,
      KeyConditionExpression: "#typename = :typename AND begins_with(#orderId, :searchTerm)",
      ExpressionAttributeNames: {
        "#typename": "__typename",
        "#orderId": "orderId",
      },
      ExpressionAttributeValues: {
        ":typename": "order",
        ":searchTerm": searchTerm
      },
      ScanIndexForward: false,
    };

    // Search by orderNumber
    const orderNumberParams = {
      TableName: tableName,
      IndexName: "search-by-order-number-index",
      Limit: 20,
      KeyConditionExpression: "#typename = :typename AND begins_with(#orderNumber, :searchTerm)",
      ExpressionAttributeNames: {
        "#typename": "__typename",
        "#orderNumber": "orderNumber",
      },
      ExpressionAttributeValues: {
        ":typename": "order",
        ":searchTerm": searchTerm
      },
      ScanIndexForward: false,
    };

    const [orderIdResults, orderNumberResults] = await Promise.all([
      docClient.send(new QueryCommand(orderIdParams)),
      docClient.send(new QueryCommand(orderNumberParams))
    ]);

    console.log("🔥 DynamoDB OrderId Results:", JSON.stringify(orderIdResults, null, 2));
    console.log("🔥 DynamoDB OrderNumber Results:", JSON.stringify(orderNumberResults, null, 2));

    // Combine and deduplicate results based on orderId
    const combinedItems = [...(orderIdResults.Items || []), ...(orderNumberResults.Items || [])];
    const uniqueItems = Array.from(new Map(combinedItems.map(item => [item.orderId, item])).values());

    return buildResponse(200, {
      message: "Orders returned successfully",
      data: combinedItems,
    });
  } catch (error) {
    console.error("❌ Error in searching orders:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const deletePersonalizedOrder = async (order) => {
  try {
    console.log("🔥 Order received for deletion:", JSON.stringify(order.id, null, 2));

    if (!order?.id) {
      return buildResponse(400, { message: "Invalid Order ID" });
    }

    const orderId = order?.id?.toString(); // Ensure orderId is a string

    // Query to get all items with the matching orderId
    const queryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "orderId = :orderId",
      ExpressionAttributeValues: {
        ":orderId": orderId
      },
      ProjectionExpression: "orderId, id", // Retrieve only necessary attributes
    });

    const { Items } = await docClient.send(queryCommand);

    if (!Items || Items.length === 0) {
      return buildResponse(404, { message: "Order not found" });
    }

    // Prepare DeleteRequest items for batch operation
    const deleteRequests = Items.map(item => ({
      DeleteRequest: {
        Key: {
          orderId: item?.orderId, 
          id: item?.id 
        }
      }
    }));

    // Batch operations can only handle 25 items at a time
    const batches = [];
    for (let i = 0; i < deleteRequests.length; i += 25) {
      batches.push(deleteRequests.slice(i, i + 25));
    }

    // Execute all batch delete operations
    const results = [];
    for (const batch of batches) {
      const batchCommand = new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch
        }
      });
      const result = await docClient.send(batchCommand);
      results.push(result);
    }

    return buildResponse(200, {
      message: `${Items.length} items deleted for order ID: ${orderId}`,
      data: {
        deletedCount: Items.length,
        orderId
      }
    });
  } catch (error) {
    console.error("❌ Error in deletePersonalizedOrder:", error);
    return buildResponse(500, { message: error.message });
  }
};
