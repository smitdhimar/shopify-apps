resource "aws_apigatewayv2_integration" "fera_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.fera-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "create_review_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /fera/review"
  target    = "integrations/${aws_apigatewayv2_integration.fera_lambda_integration.id}"
}

# GET /reviews Route
resource "aws_apigatewayv2_route" "get_reviews_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /fera/reviews"
  target    = "integrations/${aws_apigatewayv2_integration.fera_lambda_integration.id}"
  authorization_type = "NONE"
  api_key_required = true
}

# PUT /reviews/{id} Route
resource "aws_apigatewayv2_route" "update_review_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /fera/reviews/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.fera_lambda_integration.id}"
}

