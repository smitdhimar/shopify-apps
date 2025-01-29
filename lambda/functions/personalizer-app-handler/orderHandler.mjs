import { buildResponse } from "/opt/nodejs/helper.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
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
          property.name === "engraving" && property.value === "Happy Birthday!"
      )
    );

    // If order is personalized, store it in DynamoDB
    if (isPersonalized) {
      const lineItems = order.line_items.filter((item) =>
        item.properties.some(
          (property) =>
            property.name === "engraving" &&
            property.value === "Happy Birthday!"
        )
      );

      const personalizedOrderItems = lineItems.map((item) => ({
        orderId: order.id.toString(),
        id: item.id.toString(),
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        title: item.title,
        price: item.price,
        totalPrice: item.total_price,
        totalDiscount: item.total_discount,
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
