module "api_gateway" {
  source           = "./api-gateway"
  fera-handler     = module.lambda.fera-handler
  search-handler   = module.lambda.search-handler
  lambda_functions = module.lambda.lambda_functions
}

module "lambda" {
  source                    = "./lambda"
  fera_token                = var.fera_token
  fera_baseurl              = var.fera_baseurl
  threshold                 = var.threshold
  search_x_bearer_token     = var.search_x_bearer_token
  search_x_client_token     = var.search_x_client_token
  search_x_datasource_token = var.search_x_datasource_token
}

