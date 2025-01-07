resource "aws_apigatewayv2_integration" "filter_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.filter-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "filter_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /filter/products"

  target = "integrations/${aws_apigatewayv2_integration.filter_lambda_integration.id}"
}
