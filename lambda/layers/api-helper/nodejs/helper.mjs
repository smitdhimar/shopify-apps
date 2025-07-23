export const getHeaders = (authConfig, contentType = "application/json") => {
  return {
    [authConfig.tokenKeyConvention]: authConfig.tokenForAuthorization,
    Accept: "application/json",
    "Content-Type": contentType,
  };
};

export const errorHandler = (error) =>
  buildResponse(500, {
    message: error.message || "Internal Server Error",
    error: error.toString(),
  });

export const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With",
    "Access-Control-Expose-Headers": "*",
  },
  body: JSON.stringify(body),
});

// Enhanced getPathAction for blog platform
export const getPathAction = (path, httpMethod) => {
  if (path === "/webhook/strapi" && httpMethod === "POST") return "CREATE_BLOG";
  if (path === "/rating" && httpMethod === "POST") return "SUBMIT_RATING";
  if (path === "/fera/reviews" && httpMethod === "GET") return "FETCH_REVIEWS";
  if (path === "/fera/review" && httpMethod === "POST") return "CREATE_REVIEW";
  if (path === "/fera/reviews/{id}" && httpMethod === "PUT")
    return "UPDATE_REVIEW";

  return "UNKNOWN";
};

export const fetchApi = async (
  baseUrl,
  method,
  authConfig,
  body = null,
  params = null
) => {
  const url = buildUrlWithParams(baseUrl, params);

  const response = await fetch(url, {
    method,
    headers: getHeaders(authConfig),
    body: body ? JSON.stringify(body) : null,
  });

  try {
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("❌ Error in fetchApi:", error.message);
    throw error;
  }
};

const buildUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) url.searchParams.append(key, value);
    });
  }
  return url.toString();
};

// ======================= BLOG PLATFORM HELPERS =======================

// DynamoDB helper functions
export const dynamoHelper = {
  buildUpdateExpression: (updates) => {
    const expressions = [];
    const values = {};
    const names = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;

      expressions.push(`${attrName} = ${attrValue}`);
      names[attrName] = key;
      values[attrValue] = value;
    });

    return {
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    };
  },

  handleDynamoError: (error) => {
    console.error("DynamoDB Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return buildResponse(409, {
        message: "Item already exists or condition not met",
      });
    }

    if (error.name === "ResourceNotFoundException") {
      return buildResponse(404, { message: "Resource not found" });
    }

    if (error.name === "ProvisionedThroughputExceededException") {
      return buildResponse(429, {
        message: "Request rate too high, please try again",
      });
    }

    return errorHandler(error);
  },
};

// Validation helpers
export const validateRating = (rating) => {
  const allowedRatings = [25, 50, 75, 100];

  if (!rating || typeof rating !== "number") {
    return { isValid: false, error: "Rating must be a number" };
  }

  if (!allowedRatings.includes(rating)) {
    return {
      isValid: false,
      error: "Rating must be one of: 25, 50, 75, or 100",
    };
  }

  return { isValid: true };
};

export const validateBlogId = (blogId) => {
  if (!blogId || typeof blogId !== "string") {
    return { isValid: false, error: "Blog ID must be a string" };
  }

  return { isValid: true };
};

export const validateCustomerId = (customerId) => {
  if (!customerId || typeof customerId !== "string") {
    return { isValid: false, error: "Customer ID must be a string" };
  }

  return { isValid: true };
};

// Strapi helper functions
export const strapiHelper = {
  getAuthConfig: (token) => ({
    tokenKeyConvention: "Authorization",
    tokenForAuthorization: `${token}`,
  }),

  buildStrapiUrl: (baseUrl, endpoint) => {
    return `${baseUrl.replace(/\/$/, "")}/api/${endpoint.replace(/^\//, "")}`;
  },

  updateBlogRating: async (strapiUrl, token, blogId, avgRating) => {
    const authConfig = strapiHelper.getAuthConfig(token);

    try {
      // Then update using the document ID
      const updateEndpoint = strapiHelper.buildStrapiUrl(
        strapiUrl,
        `blogs/${blogId}`
      );
      return await fetchApi(updateEndpoint, "PUT", authConfig, {
        data: {
          avg_rating: avgRating,
        },
      });
    } catch (error) {
      console.error("Failed to update Strapi:", error);
      return null;
    }
  },
};
