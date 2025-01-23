module "api_gateway" {
  source                   = "./api-gateway"
  fera-handler             = module.lambda.fera-handler
  search-handler           = module.lambda.search-handler
  personalizer-app-handler = module.lambda.personalizer-app-handler
  lambda_functions         = module.lambda.lambda_functions
}

module "lambda" {
  source                    = "./lambda"
  fera_token                = var.fera_token
  fera_baseurl              = var.fera_baseurl
  threshold                 = var.threshold
  search_x_bearer_token     = var.search_x_bearer_token
  search_x_client_token     = var.search_x_client_token
  search_x_datasource_token = var.search_x_datasource_token
  image_set_table_name      = var.image_set_table_name
  backend_role_arn          = module.dynamo.backend_role_arn
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
  products_table_name  = var.products_table_name
}
