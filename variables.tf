variable "fera_token" {
  description = "fera token"
  type        = string
}

variable "fera_baseurl" {
  description = "fera base url"
  type        = string
}

variable "search_x_bearer_token" {
  description = "search_x bearer token for authorization"
  type        = string
}

variable "search_x_client_token" {
  description = "search_x client token"
  type        = string
}

variable "search_x_datasource_token" {
  description = "search_x datasource token"
  type        = string
}

variable "threshold" {
  description = "threshold used for string matching"
  type        = number
}

variable "image_bucket" {
  description = "S3 bucket name"
  type        = string

}
variable "image_set_table_name" {
  description = "table name for image sets"
  type        = string
}

variable "shopify_store_name" {
  description = "shopify store name"
  type        = string
}

variable "shopify_admin_token" {
  description = "shopify admin token"
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

variable "image_cdn_cert_arn" {
  description = "image cdn cert arn"
  type        = string
  default     = "arn:aws:acm:us-east-1:724772052309:certificate/cdf8eb35-c655-49d4-9fb6-a492c03d0258"
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
