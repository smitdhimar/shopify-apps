resource "aws_apigatewayv2_integration" "personalizer_image_set_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.personalizer-app-handler.invoke_arn
}

# POST /personalizer/image-set/create Route
resource "aws_apigatewayv2_route" "create_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /personalizer/image-set/create"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_image_set_lambda_integration.id}"
}

# GET /personalizer/image-sets Route
resource "aws_apigatewayv2_route" "get_image_sets_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/image-sets"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_image_set_lambda_integration.id}"
}

# GET /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "get_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_image_set_lambda_integration.id}"
}

# PUT /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "update_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_image_set_lambda_integration.id}"
}

# DELETE /personalizer/image-set/{id} Route
resource "aws_apigatewayv2_route" "delete_image_set_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /personalizer/image-set/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.personalizer_image_set_lambda_integration.id}"
}

