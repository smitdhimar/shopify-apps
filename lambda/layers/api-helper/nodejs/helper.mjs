export const getHeaders = (authConfig, contentType = "application/json") => {
  return {
    [authConfig.tokenKeyConvention]: authConfig.tokenForAuthorization,
    Accept: "application/json",
    "Content-Type": contentType,
  };
};

export const errorHandler = (error, functionName) => {
  console.error(`❌ Error in ${functionName}:`, error.message);
  console.error(error);
};

export const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

//getPathAction currently only used for fera-handler. can be changed by adding prefix to path and then can be compared.
export const getPathAction = (path, httpMethod) => {
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

  console.log("🔥 url", url);
  console.log("🔥 body", body);
  console.log("🔥 params", params, typeof params);

  const response = await fetch(url, {
    method,
    headers: getHeaders(authConfig),
    body: body ? JSON.stringify(body) : null,
  });

  try {
    const data = await response.json();
    console.log("🎉 response", data);

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
