module "api_gateway" {
  source                   = "./api-gateway"
  fera-handler             = module.lambda.fera-handler
  search-handler           = module.lambda.search-handler
  personalizer-app-handler = module.lambda.personalizer-app-handler
  contact-us-handler       = module.lambda.contact-us-handler
  webhook-handler          = module.lambda.webhook-handler
  blog-rating-handler      = module.lambda.blog-rating-handler
  lambda_functions         = module.lambda.lambda_functions
  cognito_client_id        = module.cognitoPoolIdentity.cognito_client_id
  cognito_user_pool_id     = module.cognitoPoolIdentity.cognito_user_pool_id
  cognito_user_pool_arn    = module.cognitoPoolIdentity.cognito_user_pool_arn
}

module "lambda" {
  source                            = "./lambda"
  fera_token                        = var.fera_token
  fera_baseurl                      = var.fera_baseurl
  threshold                         = var.threshold
  search_x_bearer_token             = var.search_x_bearer_token
  search_x_client_token             = var.search_x_client_token
  search_x_datasource_token         = var.search_x_datasource_token
  image_set_table_name              = var.image_set_table_name
  backend_role_arn                  = module.dynamo.backend_role_arn
  shopify_store_name                = var.shopify_store_name
  shopify_admin_token               = var.shopify_admin_token
  personalizer_product_table        = module.dynamo.personalizer_product_table_name
  personalizer_product_size_table   = module.dynamo.personalizer_product_size_table
  personalizer_product_config_table = module.dynamo.personalizer_product_config_table
  personalized_orders_table         = module.dynamo.personalized_orders_table_name
  image_bucket                      = var.image_bucket
  from_email                        = var.from_email
  to_email                          = var.to_email
  strapi_url                        = var.strapi_url
  strapi_api_token                  = var.strapi_api_token
  blogs_table_name                  = module.dynamo.blogs_table
  blogs_rating_table_name           = module.dynamo.blogs_rating_table
  blogs_stream_lambda_role_arn      = module.dynamo.blogs_stream_lambda_role_arn
  blogs_table_stream_arn            = module.dynamo.blogs_table_stream_arn
  blogs_rating_table_stream_arn     = module.dynamo.blogs_rating_table_stream_arn
}

module "s3_buckets" {
  source       = "./s3-buckets"
  image_bucket = var.image_bucket
}

module "cloudfronts" {
  source                = "./cloudfronts"
  s3_bucket_domain_name = module.s3_buckets.bucket_domain_name
  s3_bucket_id          = module.s3_buckets.bucket_id
  image_cdn_cert_arn    = var.image_cdn_cert_arn
}

module "amplify" {
  source       = "./amplify"
  image_bucket = module.s3_buckets.bucket_name
}

module "cognitoPoolIdentity" {
  source       = "./cognitoPoolIdentity"
  image_bucket = module.s3_buckets.bucket_name
}

module "dynamo" {
  source               = "./dynamo"
  image_set_table_name = var.image_set_table_name
  image_bucket         = var.image_bucket
}
