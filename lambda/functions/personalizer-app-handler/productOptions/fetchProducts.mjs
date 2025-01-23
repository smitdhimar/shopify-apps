import { fetchShopifyGql } from "/opt/nodejs/fetchShopifyGQL/index.mjs";

export const fetchProducts = async (after = null, first = 10) => {
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
    if (!response.data || !response.data.products) {
      throw new Error("Invalid response from Shopify");
    }

    const { edges, pageInfo } = response.data.products;

    const products = edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      images: node.images.edges.map(({ node: image }) => ({
        id: image.id,
        url: image.url,
        altText: image.altText,
      })),
      variants: node.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        sku: variant.sku,
      })),
    }));

    return {
      products,
      pageInfo: {
        hasNextPage: pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};
