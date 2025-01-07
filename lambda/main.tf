
locals {
  lambda_functions = ["fera-handler", "filter-handler"]
  # layers           = []
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
          "logs:PutLogEvents"
        ],
        "Resource": "arn:aws:logs:*:*:*",
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
# data "archive_file" "zip_the_layer_code" {
#   for_each = toset(local.layers)

#   type        = "zip"
#   source_dir  = "${path.module}/layers/${each.key}"
#   output_path = "${path.module}/layers/${each.key}.zip"
#   excludes    = ["**/*.zip"]
# }

# # Define Lambda layer versions for each layer
# resource "aws_lambda_layer_version" "layer" {
#   for_each = data.archive_file.zip_the_layer_code

#   layer_name          = each.key
#   filename            = each.value.output_path
#   source_code_hash    = each.value.output_base64sha256
#   compatible_runtimes = ["nodejs20.x"]
# }

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

resource "aws_lambda_function" "filter-handler" {
  function_name    = "filter-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.zip_the_lambda_code["filter-handler"].output_path
  source_code_hash = data.archive_file.zip_the_lambda_code["filter-handler"].output_base64sha256
  publish          = true
  timeout          = 180

  environment {
    variables = {
      SHOPIFY_TOKEN = var.shopify_token
      SHOPIFY_STORE = var.shopify_store
    }
  }
}
