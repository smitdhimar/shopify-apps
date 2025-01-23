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

variable "products_table_name" {
  description = "table name for products of personalizer app"
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