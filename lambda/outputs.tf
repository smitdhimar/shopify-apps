
output "fera-handler" {
  value = aws_lambda_function.fera-handler
}

output "search-handler" {
  value = aws_lambda_function.search-handler
}

output "lambda_functions" {
  value = local.lambda_functions
}