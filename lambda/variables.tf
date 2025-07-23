variable "fera_token" {
  description = "fera token"
  type        = string
}

variable "fera_baseurl" {
  description = "fera base url"
  type        = string
}

# the below described variables are stored for test maybe discarded later
variable "search_x_client_token" {
  description = "The fist token described in the search_x search api this might change later"
  type        = string
}

variable "search_x_datasource_token" {
  description = "The second token described in the search_x search api this might change later"
  type        = string
}

variable "search_x_bearer_token" {
  description = "Bearer token for the search_x search api"
  type        = string
}

variable "threshold" {
  description = "threshold used for string matching"
  type        = number
}

variable "image_set_table_name" {
  description = "name of the image set table"
  type        = string
}

variable "backend_role_arn" {
  description = "backend role"
  type        = string
}

variable "shopify_store_name" {
  description = "Shopify store name"
  type        = string
}

variable "shopify_admin_token" {
  description = "Shopify admin access token"
  type        = string
  sensitive   = true
}

variable "personalizer_product_table" {
  description = "Personalizer product table"
  type        = string
}

variable "personalizer_product_config_table" {
  description = "Personalizer product config table"
  type        = string
}

variable "personalizer_product_size_table" {
  description = "Personalizer product sizes table"
  type        = string
}

variable "personalized_orders_table" {
  description = "Personalized orders table name"
  type        = string
}

variable "image_bucket" {
  description = "Name of the S3 bucket for images"
  type        = string
}

variable "from_email" {
  description = "from email"
  type        = string
}
variable "to_email" {
  description = "to email"
  type        = string
}

variable "blogs_table_name" {
  description = "Name of the blogs DynamoDB table"
  type        = string
}

variable "blogs_rating_table_name" {
  description = "Name of the blogs rating DynamoDB table"
  type        = string
}

variable "strapi_url" {
  description = "Strapi base URL"
  type        = string
}

variable "strapi_api_token" {
  description = "Strapi API token for authentication"
  type        = string
  sensitive   = true
}

variable "blogs_stream_lambda_role_arn" {
  description = "ARN of the IAM role for blogs stream Lambda"
  type        = string
}

variable "blogs_table_stream_arn" {
  description = "ARN of the DynamoDB stream for blogs table"
  type        = string
}

variable "blogs_rating_table_stream_arn" {
  description = "ARN of the DynamoDB stream for blogs rating table"
  type        = string
}
