resource "aws_apigatewayv2_api" "http_api" {
  name          = "app-middleware"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins  = ["*"]
    allow_methods  = ["*"]
    allow_headers  = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    expose_headers = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
    max_age        = 3600
  }
}

resource "aws_apigatewayv2_stage" "api_gateway_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "v1"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_api_gateway" {
  for_each = toset(var.lambda_functions)

  statement_id  = "AllowApiGatewayInvoke-${each.value}"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = each.value

  # Replace this with your API Gateway ARN pattern
  source_arn = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
