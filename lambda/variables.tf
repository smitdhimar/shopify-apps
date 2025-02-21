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
  description = "to emai"
  type        = string

}
