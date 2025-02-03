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
  if (path === "/personalizer/product/{id}" && httpMethod === "GET")
    return "GET_PRODUCT";
  if (path === "/personalizer/product/{id}" && httpMethod === "PUT")
    return "UPDATE_PRODUCT";
  if (path === "/personalizer/products" && httpMethod === "GET")
    return "GET_ALL_PRODUCTS";
  if (path === "/personalizer/product/{id}" && httpMethod === "DELETE")
    return "DELETE_PRODUCT";
  if (path === "/personalizer/product-config" && httpMethod === "POST")
    return "CREATE_PRODUCT_CONFIG";
  // if (path === "/personalizer/product-config/{id}" && httpMethod === "GET")
    // return "GET_PRODUCT_CONFIG";
  if (path === "/personalizer/product-configs" && httpMethod === "GET")
    return "GET_ALL_PRODUCT_CONFIGS";
  if (path === "/personalizer/product-config/{id}" && httpMethod === "PUT")
    return "UPDATE_PRODUCT_CONFIG";
  if (path === "/personalizer/product-config/{id}" && httpMethod === "DELETE")
    return "DELETE_PRODUCT_CONFIG";
  if (path === "/personalizer/product/{id}/status" && httpMethod === "PUT")
    return "CHANGE_PRODUCT_STATUS";
  if (path === "/personalizer/personalize-order" && httpMethod === "POST")
    return "CHECK_ORDER_PERSONALIZATION";
  if (path === "/personalizer/orders" && httpMethod==="GET")
    return "GET_ORDERS";
  if (path === '/personalizer/product-config/{id}' && httpMethod==="GET")
    return "CHECK_IF_PRODUCT_CUSTOMIZED";

  return "UNKNOWN";
};
