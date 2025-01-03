module "api_gateway" {
  source           = "./api-gateway"
  fera-handler     = module.lambda.fera-handler
  search-handler   = module.lambda.search-handler
  lambda_functions = module.lambda.lambda_functions
}

module "lambda" {
  source        = "./lambda"
  fera_token    = var.fera_token
  fera_baseurl  = var.fera_baseurl
  shopify_token = var.shopify_token
  shopify_store = var.shopify_store
}