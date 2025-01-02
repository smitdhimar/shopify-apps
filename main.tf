module "api_gateway" {
  source       = "./api-gateway"
  fera-handler = module.lambda.fera-handler
}

module "lambda" {
  source       = "./lambda"
  fera_token   = var.fera_token
  fera_baseurl = var.fera_baseurl
}