
output "backend_role_arn" {
  value = aws_iam_role.backend_role.arn
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
output "aws_region" {
  value = data.aws_region.current.name
}
