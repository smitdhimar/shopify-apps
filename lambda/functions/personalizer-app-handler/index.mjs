import { buildResponse } from "/opt/nodejs/helper.mjs";
import {
  createImageSet,
  fetchImageSets,
  fetchImageSet,
  updateImageSet,
  deleteImageSet,
} from "./imageSetCrud.mjs";
import { getShopifyProduct } from "./shopifyHandler.mjs";
import { errorHandler } from "/opt/nodejs/helper.mjs";
import { getPathAction } from "./helper.mjs";
import { createProduct } from "./productHandler.mjs";

export const handler = async (event) => {
  console.log("🔥 Event received:", event);

  const {
    resource,
    httpMethod,
    body: _body,
    pathParameters,
    queryStringParameters,
  } = event;
  const pathAction = getPathAction(resource, httpMethod);
  console.log("🔥 pathAction", pathAction);
  const body = _body?.length > 0 ? JSON.parse(_body) : null;
  try {
    switch (pathAction) {
      case "CREATE_IMAGE_SET":
        return createImageSet(body);
      case "FETCH_IMAGE_SETS":
        return fetchImageSets();
      case "FETCH_IMAGE_SET":
        return fetchImageSet(pathParameters.id);

      case "IS_PRODUCT_CUSTOMIZED":

      case "UPDATE_IMAGE_SET":
        return updateImageSet(body, pathParameters.id);
      case "DELETE_IMAGE_SET":
        return deleteImageSet(pathParameters.id);
      case "GET_SHOPIFY_PRODUCT":
        return getShopifyProduct(queryStringParameters);
      case "CREATE_PRODUCT":
        return createProduct(body);
      default:
        return buildResponse(404, { message: "❌ Resource Not Found" });
    }
  } catch (error) {
    console.error("❌ Error in personalizer-app-handler:", error);
    return errorHandler(error);
  }
};
