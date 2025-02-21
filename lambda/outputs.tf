
output "fera-handler" {
  value = aws_lambda_function.fera-handler
}

output "search-handler" {
  value = aws_lambda_function.search-handler
}

output "personalizer-app-handler" {
  value = aws_lambda_function.personalizer-app-handler
}

output "contact-us-handler" {
  value = aws_lambda_function.contact-us-handler
}

output "lambda_functions" {
  value = local.lambda_functions
}