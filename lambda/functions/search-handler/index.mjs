import {
    fetchApi,
    buildResponse
} from "./helper.mjs";

export const handler = async (event) => {
    console.log("🔥 Event received:", event);

    const {
        httpMethod,
        queryStringParameters,
    } = event;

    const API_BASE_URL = 'https://dev.devxtechnology.com/';
    const CLIENT_TOKEN = process.env.SEARCH_X_CLIENT_TOKEN;
    const DATASOURCE_TOKEN = process.env.SEARCH_X_DATASOURCE_TOKEN;
    const THRESHOLD = process.env.THRESHOLD;

    queryStringParameters.limit = 20;
    queryStringParameters.threshold = THRESHOLD;

    try {
        if (httpMethod === "GET") {
            const fetchProductsResponse = await fetchApi(

                //tokens and endpoint being attached to the base url
                `${API_BASE_URL}${CLIENT_TOKEN}/datasource/${DATASOURCE_TOKEN}/search`,
                "GET",
                queryStringParameters
            );

            console.log("🔥 fetchProductsResponse:", fetchProductsResponse);

            return buildResponse(
                fetchProductsResponse.status,
                fetchProductsResponse.data
            );
        }
        else {
            return buildResponse(404, { message: "Not Found" });
        }
    }
    catch (error) {
        console.error("❌ Error in fetchApi:", error);
        return buildResponse(error.statusCode || 500, {
            message: error.message || "Internal Server Error",
            data: error?.data || null,
        });
    }
}
