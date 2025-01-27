import { fetchShopifyGql } from "/opt/nodejs/fetchShopifyGQL/index.mjs";
import { buildResponse, errorHandler } from "/opt/nodejs/helper.mjs";

export const getShopifyProduct = async (params) => {
  try {
    const query = params?.query || null;

    const searchQuery = `
      query($query: String!) {
        products(first: 10, query: $query) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                id
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                  }
                }
              }
              tags
              productType
              vendor
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables = query ? { query: query } : {};
    const storeName = process.env.SHOPIFY_STORE_NAME;
    const adminApiAccessToken = process.env.SHOPIFY_ADMIN_TOKEN;

    const response = await fetchShopifyGql(
      storeName,
      searchQuery,
      adminApiAccessToken,
      variables
    );

    console.log("🔥 Search response:", response.data);

    if (!response.data) {
      throw new Error("Invalid response from Shopify");
    }

    return buildResponse(200, {
      message: "Products Fetched",
      data: response.data.data.products.edges.map((edge) => edge.node),
    });
  } catch (error) {
    console.error("❌ Error in getShopifyProduct:", error);
    return errorHandler(error);
  }
};
