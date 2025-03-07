data "aws_region" "current" {}
resource "aws_apigatewayv2_api" "http_api" {
  name          = "http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers  = ["*"]
    allow_methods  = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins  = ["*"] # In production, specify your actual origins
    expose_headers = ["*"]
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


resource "aws_apigatewayv2_authorizer" "cognito" {
  name             = "cognito-authorizer"
  api_id           = aws_apigatewayv2_api.http_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}