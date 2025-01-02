import {
  buildResponse,
  fetchApi,
  getPathAction,
  errorHandler,
} from "./helper.mjs";

export const handler = async (event) => {
  console.log("🔥 Event received:", event);

  const API_BASE_URL = process.env.FERA_BASEURL;
  const {
    path,
    httpMethod,
    body: _body,
    pathParameters,
    queryStringParameters,
  } = event;

  const body = _body?.length > 0 ? JSON.parse(_body) : null;
  const pathAction = getPathAction(path, httpMethod);

  console.log("🔥 pathAction", pathAction);
  try {
    switch (pathAction) {
      case "CREATE_REVIEW":
        const createReviewResponse = await handleCreateReview(
          API_BASE_URL,
          body
        );
        return buildResponse(
          createReviewResponse.status,
          createReviewResponse.data
        );

      case "FETCH_REVIEWS":
        const fetchReviewsResponse = await fetchApi(
          `${API_BASE_URL}/reviews`,
          "GET",
          null,
          queryStringParameters
        );
        console.log('🔥 first', fetchReviewsResponse)
        return buildResponse(
          fetchReviewsResponse.status,
          fetchReviewsResponse.data
        );

      case "UPDATE_REVIEW":
        const updateReviewResponse = await fetchApi(
          `${API_BASE_URL}/reviews/${pathParameters.id}`,
          "PUT",
          body
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

export const handleCreateReview = async (API_BASE_URL, payload) => {
  try {
    const url = `${API_BASE_URL}/reviews`;
    const response = await fetchApi(url, "POST", { data: payload });

    return response;
  } catch (error) {
    throw error;
  }
};
