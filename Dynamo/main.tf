# --------------------------------
# Dynamo DB Iam policy
# --------------------------------

resource "aws_iam_policy" "dynamodb_access" {
  name        = "DynamoDBAccessPolicy"
  description = "IAM Policy to access DynamoDB"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "lambda:GetLayerVersion",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:BatchGetItem",
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:logs:*:*:*",
          "arn:aws:lambda:*:*:layer:api-helper:*",
          "arn:aws:dynamodb:*:*:table/*",
          "arn:aws:dynamodb:*:*:table/*/index/*",
          "arn:aws:s3:::${var.image_bucket}/*"
        ]
      }
    ]
  })
}

# --------------------------------  
# Dynamo DB Iam role
# --------------------------------

resource "aws_iam_role" "backend_role" {
  name = "BackendRoleForDynamoDB"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }

      }
    ]
  })
}

# --------------------------------
# Dynamo DB Tables
# --------------------------------

# --------------------------------
# Image Set Table
# --------------------------------  
resource "aws_dynamodb_table" "image_sets_personlizer_app" {
  name         = var.image_set_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = "Developement"
  }
}

# Product Table
resource "aws_dynamodb_table" "personalizer_products" {
  name         = "personalizer-product-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
  tags = {
    Environment = "Developement"
  }
}

#sizes table
resource "aws_dynamodb_table" "personalizer_product_size_table" {
  name         = "personalizer-variant-sizes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
  tags = {
    Environment = "Developement"
  }
}

# Product Config Table
resource "aws_dynamodb_table" "product_config_table" {
  name         = "personalizer-product-config-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"
  range_key    = "id"

  attribute {
    name = "productId"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = "Development"
  }
}

output "product_config_table_name" {
  value = aws_dynamodb_table.product_config_table.name
}

# Personalized Orders Table
resource "aws_dynamodb_table" "personalized_orders" {
  name         = "personalizer-order-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"
  range_key    = "id"

  attribute {
    name = "orderId"
    type = "S"
  }
  attribute {
    name = "orderNumber"
    type = "S"
  }
  attribute {
    name = "id"
    type = "S"
  }
  global_secondary_index {
    name            = "search-by-order-number-index"
    hash_key        = "__typename"
    range_key       = "orderNumber"
    projection_type = "ALL"
    read_capacity   = 5
    write_capacity  = 5
  }
  global_secondary_index {
    name            = "personalized-orders-index"
    hash_key        = "__typename"
    range_key       = "createdAt"
    projection_type = "ALL"
    read_capacity   = 5
    write_capacity  = 5
  }

  global_secondary_index {
    name            = "search-order-index"
    hash_key        = "__typename"
    range_key       = "orderId"
    projection_type = "ALL"
    read_capacity   = 5
    write_capacity  = 5
  }

  attribute {
    name = "__typename"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  tags = {
    Environment = "Development"
  }
}

output "personalized_orders_table_name" {
  value = aws_dynamodb_table.personalized_orders.name
}

# --------------------------------
# Policy attachment
# --------------------------------  
resource "aws_iam_role_policy_attachment" "attach_dynamodb_policy" {
  role       = aws_iam_role.backend_role.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

# Get current AWS region
data "aws_region" "current" {}
