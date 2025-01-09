
locals {
  lambda_functions = ["fera-handler", "search-handler"]
  layers           = ["api-helper"]
}
# ======================= LAMBDA ROLE AND POLICY =======================
resource "aws_iam_role" "lambda_execution_role" {
  name               = "aws_lambda_role"
  assume_role_policy = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
  ]
  }
  EOF
}

resource "aws_iam_policy" "iam_policy_for_lambda" {
  name        = "aws_iam_policy_for_aws_lambda_role"
  path        = "/"
  description = "AWS IAM Policy for managing AWS Lambda role"
  policy      = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
      {
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "lambda:GetLayerVersion"
        ],
        "Resource": [
        "arn:aws:logs:*:*:*",
        "arn:aws:lambda:*:*:layer:api-helper:*"
        ],
        "Effect": "Allow"
      }
  ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_default_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.iam_policy_for_lambda.arn
}


#============================== layers ==============================

data "archive_file" "zip_the_layer_code" {
  for_each = toset(local.layers)

  type        = "zip"
  source_dir  = "${path.module}/layers/${each.key}"
  output_path = "${path.module}/layers/${each.key}.zip"
  excludes    = ["**/*.zip"]
}

# Define Lambda layer versions for each layer
resource "aws_lambda_layer_version" "api-helper" {

  layer_name          = "api-helper"
  filename            = data.archive_file.zip_the_layer_code["api-helper"].output_path
  source_code_hash    = data.archive_file.zip_the_layer_code["api-helper"].output_base64sha256
  compatible_runtimes = ["nodejs20.x"]
  skip_destroy        = true
}

# ======================= LAMBDA FUNCTION =======================
data "archive_file" "zip_the_lambda_code" {
  for_each = toset(local.lambda_functions)

  type        = "zip"
  source_dir  = "${path.module}/functions/${each.key}"
  output_path = "${path.module}/functions/${each.key}.zip"
  excludes    = ["**/*.zip"]
}

resource "aws_lambda_function" "fera-handler" {
  function_name    = "fera-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.zip_the_lambda_code["fera-handler"].output_path
  source_code_hash = data.archive_file.zip_the_lambda_code["fera-handler"].output_base64sha256
  publish          = true
  timeout          = 180
  layers           = [aws_lambda_layer_version.api-helper.arn]
  depends_on       = [aws_lambda_layer_version.api-helper]
  tracing_config {
    mode = "Active"
  }
  environment {
    variables = {
      FERA_TOKEN   = var.fera_token
      FERA_BASEURL = var.fera_baseurl
    }
  }


}


resource "aws_lambda_function" "search-handler" {
  function_name    = "search-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.zip_the_lambda_code["search-handler"].output_path
  source_code_hash = data.archive_file.zip_the_lambda_code["search-handler"].output_base64sha256
  publish          = true
  timeout          = 180
  layers           = [aws_lambda_layer_version.api-helper.arn]
  depends_on       = [aws_lambda_layer_version.api-helper]
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      SEARCH_X_CLIENT_TOKEN     = var.search_x_client_token
      SEARCH_X_DATASOURCE_TOKEN = var.search_x_datasource_token
      SEARCH_X_BEARER_TOKEN     = var.search_x_bearer_token
      THRESHOLD                 = var.threshold
    }
  }
}
