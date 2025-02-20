resource "aws_apigatewayv2_integration" "contact_us_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.contact-us-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "contact_us_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /ses/contact-us"
  target    = "integrations/${aws_apigatewayv2_integration.contact_us_lambda_integration.id}"
}