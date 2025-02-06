# Delete or comment out these duplicate outputs since they're already in main.tf
# output "cloudfront_oai_canonical_user_id" {
#   value = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id
# }

# output "cloudfront_distribution_domain_name" {
#   value = aws_cloudfront_distribution.image_cdn.domain_name
# }

output "cloudfront_oai_canonical_user_id" {
  value = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.image_cdn.domain_name
}
