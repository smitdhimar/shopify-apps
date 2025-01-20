output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.image_bucket.bucket_regional_domain_name
}

output "bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.image_bucket.id
}

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.image_bucket.bucket
}