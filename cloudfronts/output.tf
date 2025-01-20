output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.image_cdn.domain_name
}

output "cloudfront_oai_canonical_user_id" {
  description = "Canonical user ID of the CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id
}
