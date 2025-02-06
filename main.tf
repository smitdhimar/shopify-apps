module "api_gateway" {
  source                   = "./api-gateway"
  fera-handler             = module.lambda.fera-handler
  search-handler           = module.lambda.search-handler
  personalizer-app-handler = module.lambda.personalizer-app-handler
  lambda_functions         = module.lambda.lambda_functions
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
  personalizer_product_config_table = module.dynamo.personalizer_product_config_table
  personalized_orders_table         = module.dynamo.personalized_orders_table_name
  image_bucket                      = var.image_bucket
}

module "s3_buckets" {
  source                           = "./s3-buckets"
  cloudfront_oai_canonical_user_id = module.cloudfronts.cloudfront_oai_canonical_user_id
  image_bucket                     = var.image_bucket
}

module "cloudfronts" {
  source                = "./cloudfronts"
  s3_bucket_domain_name = module.s3_buckets.bucket_domain_name
  s3_bucket_id          = module.s3_buckets.bucket_id
  depends_on            = [module.s3_buckets]
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
