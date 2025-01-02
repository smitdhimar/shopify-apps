resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.fera-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "product_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /review"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}


# POST /reviews Route
resource "aws_apigatewayv2_route" "post_review_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /reviews"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# GET /reviews Route
resource "aws_apigatewayv2_route" "get_reviews_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /reviews"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# PUT /reviews/{id} Route
resource "aws_apigatewayv2_route" "update_review_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /reviews/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

