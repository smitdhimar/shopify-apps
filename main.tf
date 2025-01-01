module "api_gateway" {
  source       = "./api-gateway"
  fera-handler = module.lambda.fera-handler
}

module "lambda" {
  source = "./lambda"
}