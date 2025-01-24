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
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:logs:*:*:*",
          "arn:aws:lambda:*:*:layer:api-helper:*",
          "arn:aws:dynamodb:*:*:table/*"
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

# --------------------------------
# Image Set Table
# --------------------------------  
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
# --------------------------------
# Policy attachment
# --------------------------------  
resource "aws_iam_role_policy_attachment" "attach_dynamodb_policy" {
  role       = aws_iam_role.backend_role.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

# Get current AWS region
data "aws_region" "current" {}



