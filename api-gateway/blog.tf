resource "aws_apigatewayv2_integration" "webhook_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.webhook-handler.invoke_arn
}

resource "aws_apigatewayv2_integration" "blog_rating_lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = var.blog-rating-handler.invoke_arn
}

resource "aws_apigatewayv2_route" "strapi_webhook_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /webhook/strapi"
  target    = "integrations/${aws_apigatewayv2_integration.webhook_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "submit_rating_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /rating"
  target    = "integrations/${aws_apigatewayv2_integration.blog_rating_lambda_integration.id}"
}
