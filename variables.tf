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
