import { fetchShopifyGql } from "/opt/nodejs/fetchShopifyGQL/index.mjs";
import { buildResponse } from "/opt/nodejs/helper.mjs";

export const getShopifyProduct = async (params) => {
  try {
    const query = params?.query || null;

    const searchQuery = `
    query($query: String) {
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
            images(first: 250) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  image {
                    id
                    url
                  }
                }
              }
            }
            options {
              id
              name
              values
              
            }
          }
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
      data: response.data.data.products.edges.map((edge) => ({
        ...edge.node,
        variants: edge.node.variants.edges.map((variant) => variant.node),
      })),
    });
  } catch (error) {
    console.error("❌ Error in product search:", error);
    return buildResponse(500, { message: error.message });
  }
};

export const getShopifyProductVariants = async (id) => {
  try {
    console.log("Receievd Id: ", id);
    if(!id){
      return buildResponse(500, { message: "No id was found for product." });
    }
    const query = null;
    const searchQuery = `
    query product {
      product(id: "gid://shopify/Product/${id.toString()}") {
        variants(first: 50) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`;

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
      message: "Product Variant Fetched",
      data: response?.data?.data?.product?.variants?.edges?.map((node) =>  node?.node?.title)
    });
  } catch (error) {
    console.error("❌ Error in product variant search:", error);
    return buildResponse(500, { message: error.message });
  }
};