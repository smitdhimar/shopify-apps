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
