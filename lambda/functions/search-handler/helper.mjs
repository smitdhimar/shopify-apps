export const getHeaders = (contentType = "application/json") => ({
  Authorization: process.env.SEARCH_X_BEARER_TOKEN,
  Accept: "application/json",
  "Content-Type": contentType,
});

export const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
  },
  body: JSON.stringify(body),
});

const buildUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) url.searchParams.append(key, value);
    });
  }
  return url.toString();
};

export const fetchApi = async (baseUrl, method, params) => {
  try {
    const url = buildUrlWithParams(baseUrl, params);
    console.log("🔥 url:", url);
    const response = await fetch(url, {
      method,
      headers: getHeaders(),
    })
    const data = await response.json();
    if (!response.ok) {
      throw {
        statusCode: response.status,
        message: data.message || 'API request failed',
        data
      };
    }
    return {
      status: response.status,
      data,
    };
  }
  catch (error) {
    console.error("❌ Error in fetchApi:", error.message);
    throw error
  }
}