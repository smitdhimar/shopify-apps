resource "aws_apigatewayv2_api" "http_api" {
    name          = "app-middleware"
    protocol_type = "HTTP"
  }

  resource "aws_apigatewayv2_integration" "lambda_integration" {
    api_id             = aws_apigatewayv2_api.http_api.id
    integration_type   = "AWS_PROXY"
    integration_method = "POST"
    integration_uri    = var.fera-handler.invoke_arn
  }


  resource "aws_apigatewayv2_stage" "api_gateway_stage" {
    api_id      = aws_apigatewayv2_api.http_api.id
    name        = "v1"
    auto_deploy = true
  }

  resource "aws_apigatewayv2_route" "product_route" {
    api_id    = aws_apigatewayv2_api.http_api.id
    route_key = "POST /review"
    target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
  }


  resource "aws_lambda_permission" "allow_api_gateway" {
    statement_id  = "AllowApiGatewayInvoke"
    action        = "lambda:InvokeFunction"
    principal     = "apigateway.amazonaws.com"
    function_name = var.fera-handler.function_name
  }
