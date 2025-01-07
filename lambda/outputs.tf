
output "fera-handler" {
  value = aws_lambda_function.fera-handler
}

output "filter-handler" {
  value = aws_lambda_function.filter-handler
}

output "lambda_functions" {
  value = local.lambda_functions
}