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
# IAM role for the DynamoDB stream handler Lambda
# --------------------------------

resource "aws_iam_role" "blogs_stream_lambda_role" {
  name = "blogs-stream-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# --------------------------------
# IAM policy for DynamoDB stream access
# --------------------------------

resource "aws_iam_role_policy" "blogs_streams_lambda_policy" {
  name = "blogs-streams-lambda-policy"
  role = aws_iam_role.blogs_stream_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams"
        ]
        Resource = [
          aws_dynamodb_table.blogs_table.stream_arn,
          aws_dynamodb_table.blogs_rating_table.stream_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.blogs_table.arn,
          aws_dynamodb_table.blogs_rating_table.arn
        ]
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
    read_capacity   = 0
    write_capacity  = 0
  }
  global_secondary_index {
    name            = "personalized-orders-index"
    hash_key        = "__typename"
    range_key       = "createdAt"
    projection_type = "ALL"
    read_capacity   = 0
    write_capacity  = 0
  }

  global_secondary_index {
    name            = "search-order-index"
    hash_key        = "__typename"
    range_key       = "orderId"
    projection_type = "ALL"
    read_capacity   = 0
    write_capacity  = 0
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

# Blogs Table with DynamoDB Stream enabled
resource "aws_dynamodb_table" "blogs_table" {
  name         = "blogs-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "blogId"

  # Enable DynamoDB Stream
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "blogId"
    type = "S"
  }

  tags = {
    Environment = "Development"
  }
}

#Blogs Rating Table
resource "aws_dynamodb_table" "blogs_rating_table" {
  name         = "blogs-rating-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "blogId"
  range_key    = "customerId"

  # Enable DynamoDB Stream
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "blogId"
    type = "S"
  }

  attribute {
    name = "customerId"
    type = "S"
  }
  tags = {
    Environment = "Development"
  }
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
