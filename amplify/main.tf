resource "aws_iam_role" "amplify_role" {
  name = "amplify-s3-access-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "amplify_s3_policy" {
  name        = "amplify_s3_policy"
  description = "Policy for S3 access by Amplify"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.image_bucket}/*",
          "arn:aws:s3:::${var.image_bucket}"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_s3_policy_attach" {
  role       = aws_iam_role.amplify_role.name
  policy_arn = aws_iam_policy.amplify_s3_policy.arn
}
