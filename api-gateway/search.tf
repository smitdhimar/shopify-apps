resource "aws_apigatewayv2_integration" "search_handler_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.search-handler.invoke_arn

}

# get /search/products Route
resource "aws_apigatewayv2_route" "get_products_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /search"
  target    = "integrations/${aws_apigatewayv2_integration.search_handler_integration.id}"
}