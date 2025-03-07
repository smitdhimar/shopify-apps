# Lambda Integration
resource "aws_apigatewayv2_integration" "personalizer_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.personalizer-app-handler.invoke_arn
}

# POST /personalizer/image-set/create Route
resource "aws_apigatewayv2_route" "create_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/image-set/create"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# GET /personalizer/image-sets Route
resource "aws_apigatewayv2_route" "fetch_image_sets_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/image-sets"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# GET /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "get_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# PUT /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "update_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# DELETE /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "delete_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# GET /personalizer/shopify-products Route
resource "aws_apigatewayv2_route" "get_shopify_products_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/shopify-products"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# POST /personalizer/product Route
resource "aws_apigatewayv2_route" "create_product_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/product"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# GET /personalizer/product/{id} Route
resource "aws_apigatewayv2_route" "get_product_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/product/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# PUT /personalizer/product/{id} Route
resource "aws_apigatewayv2_route" "update_product_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /personalizer/product/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# GET /personalizer/products Route
resource "aws_apigatewayv2_route" "get_all_products_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/products"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# DELETE /personalizer/product/{id} Route
resource "aws_apigatewayv2_route" "delete_product_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /personalizer/product/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# Product Config Routes
resource "aws_apigatewayv2_route" "create_product_config_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/product-config"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "get_product_config_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/product-config/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "get_all_product_configs_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/product-configs"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "update_product_config_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /personalizer/product-config/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "delete_product_config_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /personalizer/product-config/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "check_order_personalization_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/personalize-order"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# orders fetch
resource "aws_apigatewayv2_route" "fetch_orders_route" {
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = "GET /personalizer/orders"
  target             = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# PUT /personalizer/product/{id}/status Route
resource "aws_apigatewayv2_route" "update_product_status_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /personalizer/product/{id}/status"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}

# POST /personalizer/generate-upload-url Route
resource "aws_apigatewayv2_route" "generate_upload_url_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/generate-upload-url"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_lambda_integration.id}"
}
