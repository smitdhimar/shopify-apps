resource "aws_cognito_identity_pool" "personalizer_identity_pool" {
  identity_pool_name               = "personalizer_identity_pool"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.personalizer_client.id
    provider_name           = aws_cognito_user_pool.personalizer_user_pool.endpoint
    server_side_token_check = true
  }
}

resource "aws_cognito_user_pool" "personalizer_user_pool" {
  name = "personalizer_user_pool"
}

resource "aws_cognito_user_pool_client" "personalizer_client" {
  name         = "personalizer_client"
  user_pool_id = aws_cognito_user_pool.personalizer_user_pool.id
}

resource "aws_iam_role" "unauthenticated_role" {
  name = "unauthenticated-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          "StringEquals" = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.personalizer_identity_pool.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "unauthenticated_policy" {
  name        = "unauthenticated-policy"
  description = "Policy for unauthenticated users"
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

resource "aws_iam_role" "authenticated" {
  name = "authenticated-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.personalizer_identity_pool.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "authenticated" {
  name = "authenticated-policy"
  role = aws_iam_role.authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-sync:*",
          "cognito-identity:*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "unauthenticated_policy_attach" {
  role       = aws_iam_role.unauthenticated_role.name
  policy_arn = aws_iam_policy.unauthenticated_policy.arn
}

resource "aws_cognito_identity_pool_roles_attachment" "personalizer_identity_pool_roles" {
  identity_pool_id = aws_cognito_identity_pool.personalizer_identity_pool.id

  roles = {
    unauthenticated = aws_iam_role.unauthenticated_role.arn
    authenticated   = aws_iam_role.authenticated.arn
  }
}
