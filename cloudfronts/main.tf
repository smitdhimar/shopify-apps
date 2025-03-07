# Create Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for image bucket"
}

# Create CloudFront distribution
resource "aws_cloudfront_distribution" "image_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "CDN for image bucket"

  # Add the alias that was manually created so it won’t be removed
  # aliases = [
  #   "personaliser-media.celloworld.com",
  # ]

  origin {
    domain_name = var.s3_bucket_domain_name
    origin_id   = "S3-${var.s3_bucket_id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }

    custom_header {
      name  = "Access-Control-Allow-Origin"
      value = "*"
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.s3_bucket_id}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    # Add CORS headers in response
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors_policy.id
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }

  wait_for_deployment = false
}

# Create CORS headers policy
resource "aws_cloudfront_response_headers_policy" "cors_policy" {
  name    = "corsPolicy"
  comment = "CORS policy for S3 bucket access"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    }

    access_control_allow_origins {
      items = ["*"]
    }

    access_control_expose_headers {
      items = ["ETag"]
    }

    access_control_max_age_sec = 3600
    origin_override            = true
  }
}
