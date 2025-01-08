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