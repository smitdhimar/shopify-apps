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
import {
  createProduct,
  getProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  changeProductStatus,
} from "./productHandler.mjs";
import {
  createProductConfig,
  getProductConfig,
  getAllProductConfigs,
  updateProductConfig,
  deleteProductConfig,
  getProductByProductId,
} from "./productConfigHandler.mjs";
import { checkOrderPersonalization, getOrders, searchOrders } from "./orderHandler.mjs";
import { generatePresignedUrl } from "./s3Handler.mjs";

export const handler = async (event) => {
  console.log("🔥 Event received:", event);

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(200, {});
  }

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

      // case "IS_PRODUCT_CUSTOMIZED":

      case "UPDATE_IMAGE_SET":
        return updateImageSet(body, pathParameters.id);
      case "DELETE_IMAGE_SET":
        return deleteImageSet(pathParameters.id);
      case "CHECK_IF_PRODUCT_CUSTOMIZED":
        return getProductByProductId(pathParameters.id);
      case "GET_SHOPIFY_PRODUCT":
        return getShopifyProduct(queryStringParameters);
      case "CREATE_PRODUCT":
        return createProduct(body);
      case "GET_PRODUCT":
        return getProduct(pathParameters.id);
      case "UPDATE_PRODUCT":
        return updateProduct(pathParameters.id, body);
      case "GET_ALL_PRODUCTS":
        return getAllProducts();
      case "DELETE_PRODUCT":
        return deleteProduct(pathParameters.id);
      case "CREATE_PRODUCT_CONFIG":
        return createProductConfig(body);
      case "GET_PRODUCT_CONFIG":
        return getProductConfig(pathParameters.id);
      case "GET_ALL_PRODUCT_CONFIGS":
        return getAllProductConfigs();
      case "UPDATE_PRODUCT_CONFIG":
        return updateProductConfig(pathParameters.id, body);
      case "DELETE_PRODUCT_CONFIG":
        return deleteProductConfig(pathParameters.id);
      case "CHECK_ORDER_PERSONALIZATION":
        return checkOrderPersonalization(body);
      case "GET_ORDERS":
        return getOrders(queryStringParameters);
      case "CHANGE_PRODUCT_STATUS":
        const { status } = JSON.parse(_body);
        return changeProductStatus(pathParameters.id, status);
      case "GENERATE_PRESIGNED_URL":
        const { fileName, contentType } = body;
        return generatePresignedUrl(fileName, contentType);
      case "SEARCH_ORDERS":
        return searchOrders(queryStringParameters);
      default:
        return buildResponse(404, { message: "❌ Resource Not Found" });
    }
  } catch (error) {
    console.error("❌ Error in personalizer-app-handler:", error);
    return errorHandler(error);
  }
};
