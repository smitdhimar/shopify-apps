import { fetchShopifyGql } from "/opt/nodejs/fetchShopifyGQL/index.mjs";

export const getShopifyProduct = async (after = null, first = 10) => {
  try {
    const variables = {
      first,
      after,
    };

    const productQuery = `
      query products($first: Int, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
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
            }
          }
          pageInfo {
            hasNextPage 
            endCursor
          }
        }
      }
    `;

    const storeName = process.env.SHOPIFY_STORE_NAME;
    const adminApiAccessToken = process.env.SHOPIFY_ADMIN_TOKEN;

    console.log("🔥 variables", variables, storeName);
    const response = await fetchShopifyGql(
      storeName,
      productQuery,
      adminApiAccessToken,
      variables
    );

    console.log("🔥 response", response);

    if (!response.data) {
      throw new Error("Invalid response from Shopify");
    }

    return {
      products: response.data.products,
    };
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};
