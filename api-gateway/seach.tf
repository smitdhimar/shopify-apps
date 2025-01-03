resource "aws_apigatewayv2_integration" "search_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.search-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "search_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /search/products"

  target = "integrations/${aws_apigatewayv2_integration.search_lambda_integration.id}"
}
