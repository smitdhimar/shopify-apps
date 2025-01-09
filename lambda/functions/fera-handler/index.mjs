import {
  fetchApi,
  getPathAction,
  buildResponse
} from "/opt/nodejs/helper.mjs";

export const handler = async (event) => {
  console.log("🔥 Event received:", event);

  const API_BASE_URL = process.env.FERA_BASEURL;

  const {
    resource,
    httpMethod,
    body: _body,
    pathParameters,
    queryStringParameters,
  } = event;

  const authConfig = {
    tokenKeyConvention: "SECRET-KEY",
    tokenForAuthorization: process.env.FERA_TOKEN,
  };

  const body = _body?.length > 0 ? JSON.parse(_body) : null;
  const pathAction = getPathAction(resource, httpMethod);

  console.log("🔥 pathAction", pathAction);
  try {
    switch (pathAction) {
      case "CREATE_REVIEW":
        const url = `${API_BASE_URL}/reviews`;

        const createReviewResponse = await fetchApi(url, "POST", authConfig, {
          data: body,
        });
        return buildResponse(
          createReviewResponse.status,
          createReviewResponse.data
        );

      case "FETCH_REVIEWS":
        const fetchReviewsResponse = await fetchApi(
          `${API_BASE_URL}/reviews`,
          "GET",
          authConfig,
          null,
          queryStringParameters
        );

        return buildResponse(
          fetchReviewsResponse.status,
          fetchReviewsResponse.data
        );

      case "UPDATE_REVIEW":
        const updateReviewResponse = await fetchApi(
          `${API_BASE_URL}/reviews/${pathParameters.id}`,
          "PUT",
          authConfig,
          {
            data: body,
          }
        );
        return buildResponse(
          updateReviewResponse.status,
          updateReviewResponse.data
        );

      default:
        return buildResponse(404, { message: "Resource Not Found" });
    }
  } catch (error) {
    console.error("❌ Error occurred:", error);
    return buildResponse(error.statusCode || 500, {
      message: error.message || "Internal Server Error",
      data: error?.data || null,
    });
  }
};
