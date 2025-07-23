output "backend_role_arn" {
  value = aws_iam_role.backend_role.arn
}

output "product_config_table_name" {
  value = aws_dynamodb_table.product_config_table.name
}

output "personalized_orders_table_name" {
  value = aws_dynamodb_table.personalized_orders.name
}

output "personalizer_product_table_name" {
  value = aws_dynamodb_table.personalizer_products.name
}

output "personalizer_product_config_table" {
  value = aws_dynamodb_table.product_config_table.name
}

output "personalizer_product_size_table" {
  value = aws_dynamodb_table.personalizer_product_size_table.name
}

output "blogs_table" {
  value = aws_dynamodb_table.blogs_table.name
}

output "blogs_rating_table" {
  value = aws_dynamodb_table.blogs_rating_table.name
}

output "blogs_table_stream_arn" {
  value       = aws_dynamodb_table.blogs_table.stream_arn
  description = "ARN of the DynamoDB stream for the blogs table"
}

output "blogs_rating_table_stream_arn" {
  value       = aws_dynamodb_table.blogs_rating_table.stream_arn
  description = "ARN of the DynamoDB stream for the blogs rating table"
}

output "blogs_stream_lambda_role_arn" {
  value       = aws_iam_role.blogs_stream_lambda_role.arn
  description = "ARN of the IAM role for the blogs stream Lambda function"
}

output "aws_region" {
  value = data.aws_region.current.name
}
