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

export const getOrders = async () => {
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
      message: "Orders returned",
      data: result.Items,
    }); // Return the array of items
  } catch (error) {
    console.error("❌ Error in fetching orders:", error);
    throw new Error("Failed to Orders");
  }
};
