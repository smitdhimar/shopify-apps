import { buildResponse, getPathAction } from "/opt/nodejs/helper.mjs";
import { createImageSet, fetchImageSets, fetchImageSet, updateImageSet, deleteImageSet } from "./imageSetCrud.mjs";
export const handler = async (event) => {
  console.log("🔥 Event received:", event);

  const {
    resource,
    httpMethod,
    body: _body,
    pathParameters,
  } = event;
  const pathAction = getPathAction(resource, httpMethod);
  const body = _body?.length > 0 ? JSON.parse(_body) : null;
  try {
    switch (pathAction) {
      case "CREATE_IMAGE_SET":
        return createImageSet(body);
      case "FETCH_IMAGE_SETS":
        return fetchImageSets();
      case "FETCH_IMAGE_SET":
        return fetchImageSet(pathParameters.id);
      case "FETCH_PRODUCT_OPTIONS":

      case "IS_PRODUCT_CUSTOMIZED":
        
      case "UPDATE_IMAGE_SET":
        return updateImageSet(body, pathParameters.id);
      case "DELETE_IMAGE_SET":
        return deleteImageSet(pathParameters.id);
      default:
        return buildResponse(404, { message: "❌ Resource Not Found" });
    }
  } catch (error) {
    console.error("❌ Error in personalizer-app-handler:", error);
    return buildResponse(500, { message: "Internal Server Error" });
  }
};
