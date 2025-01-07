import { buildResponse, errorHandler } from "./helper.mjs";

const SHOPIFY_API_URL_TEMPLATE = `https://{storeName}.myshopify.com/api/2025-01/graphql.json`;

const getPathAction = (path, httpMethod) => {
  const routes = {
    "/filter/products:GET": "FILTER_PRODUCTS",
  };
  return routes[`${path}:${httpMethod}`] || "UNKNOWN";
};

export const handler = async (event) => {
  const STORE_NAME = process.env.SHOPIFY_STORE;
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_TOKEN;

  const SHOPIFY_API_URL = SHOPIFY_API_URL_TEMPLATE.replace(
    "{storeName}",
    STORE_NAME
  );

  const { resource, httpMethod, queryStringParameters } = event;

  // Extract query parameters with defaults
  const {
    search = "",
    sortBy = "title",
    sortOrder = "asc",
    minPrice,
    maxPrice,
    tags,
    page = 1,
    pageSize = 10,
    predictive = "false",
  } = queryStringParameters || {};

  console.log("🔥 event", event);
  const pathAction = getPathAction(resource, httpMethod);
  console.log("🔥 Path Action:", pathAction);
  console.log("🔥 Path queryStringParameters:", queryStringParameters);

  try {
    switch (pathAction) {
      case "FILTER_PRODUCTS":
        if (predictive === "true" && search) {
          return await handlePredictiveSearch({
            search,
            SHOPIFY_API_URL,
            SHOPIFY_ACCESS_TOKEN,
          });
        }

        return await handleFilter({
          search,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice,
          tags,
          page,
          pageSize,
          SHOPIFY_API_URL,
          SHOPIFY_ACCESS_TOKEN,
        });

      default:
        return buildResponse(404, { message: "Resource Not Found" });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return buildResponse(error.statusCode || 500, {
      message: error.message || "Internal Server Error",
    });
  }
};

const handlePredictiveSearch = async ({
  search,
  SHOPIFY_API_URL,
  SHOPIFY_ACCESS_TOKEN,
}) => {
  try {
    const query = `
      query PredictiveSearch($search: String!) {
        products(first: 10, query: $search) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `;

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables: { search } }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      errorHandler(errors[0], "handlePredictiveSearch");
      throw new Error(
        "Failed to fetch predictive search results from Shopify."
      );
    }

    const predictiveResults = data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
    }));

    return buildResponse(200, { predictiveResults });
  } catch (error) {
    console.error("Predictive Search Error:", error);
    throw new Error("Failed to fetch predictive search results.");
  }
};
const handleFilter = async ({
  search,
  sortBy,
  sortOrder,
  minPrice,
  maxPrice,
  tags,
  page,
  pageSize,
  SHOPIFY_API_URL,
  SHOPIFY_ACCESS_TOKEN,
}) => {
  try {
    // Determine the cursor for the current page
    const first = parseInt(pageSize, 10);
    const after =
      page > 1
        ? Buffer.from(`${(page - 1) * pageSize}`).toString("base64")
        : null;

    const query = `
      query SearchProducts(
          $search: String!,
          $first: Int!,
          $after: String,
          $sortKey: ProductSortKeys,
          $reverse: Boolean
      ) {
          products(query: $search, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
            edges {
              cursor
              node {
                id
                title
                tags
                priceRange {
                  minVariantPrice {
                    amount
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

    const variables = {
      search,
      first,
      after,
      sortKey: sortBy === "title" ? "TITLE" : "PRICE",
      reverse: sortOrder === "desc",
    };

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      errorHandler(errors[0], "handleFilter");
      throw new Error("Failed to fetch search results from Shopify.");
    }

    const edges = data.products.edges;
    const pageInfo = data.products.pageInfo;

    let products = edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      tags: node.tags,
    }));

    // Apply additional filters locally
    products = products.filter((product) => {
      if (minPrice && product.price < minPrice) return false;
      if (maxPrice && product.price > maxPrice) return false;
      if (tags && !tags.split(",").every((tag) => product.tags.includes(tag)))
        return false;
      return true;
    });

    return buildResponse(200, {
      message: "Success",
      data: products,
      pagination: {
        currentPage: page,
        pageSize,
        hasNextPage: pageInfo.hasNextPage,
        nextCursor: pageInfo.endCursor,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    throw new Error(error.message || "Failed to process search.");
  }
};
