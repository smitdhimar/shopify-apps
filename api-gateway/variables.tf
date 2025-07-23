variable "fera-handler" {
  description = "The name of the stack"
  type        = any
}

variable "contact-us-handler" {
  description = "contact us handler var"
  type        = any
}

variable "search-handler" {
  description = "The name of the lambda function used for the search query."
  type        = any
}

variable "personalizer-app-handler" {
  description = "The name of the lambda function used for presonalization app."
  type        = any
}

variable "webhook-handler" {
  description = "The webhook handler lambda function for Strapi blog creation"
  type        = any
}

variable "blog-rating-handler" {
  description = "The blog rating handler lambda function for rating submissions"
  type        = any
}


variable "lambda_functions" {
  description = "The name of the stack"
  type        = any
}

variable "cognito_client_id" {
  description = "The ID of the Cognito User Pool Client"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "The name of the stack"
  type        = any
}
