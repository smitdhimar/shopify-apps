export const getPathAction = (path, httpMethod) => {
  if (path === "/personalizer/image-sets" && httpMethod === "GET")
    return "FETCH_IMAGE_SETS";
  if (path === "/personalizer/product/{id}" && httpMethod === "POST")
    return "IS_PRODUCT_CUSTOMIZED";
  if (path === "/personalizer/image-set/{id}" && httpMethod === "GET")
    return "FETCH_IMAGE_SET";
  if (path === "/personalizer/image-set/create" && httpMethod === "POST")
    return "CREATE_IMAGE_SET";
  if (path === "/personalizer/image-set/{id}" && httpMethod === "PUT")
    return "UPDATE_IMAGE_SET";
  if (path === "/personalizer/image-set/{id}" && httpMethod === "DELETE")
    return "DELETE_IMAGE_SET";
  if (path === "/personalizer/shopify-products" && httpMethod === "GET")
      return "GET_SHOPIFY_PRODUCT";
    if (path === "/personalizer/product" && httpMethod === "POST")
      return "CREATE_PRODUCT";

  return "UNKNOWN";
};
