# Shopify apps middleware/backend
A IaaC for integration shopify, nextjs, and other apis. + serverless backend for personalizer app (Lambda, API Gateway, DynamoDB, S3, Cognito, cloudfront).

# Tech stack
![Terraform](https://img.shields.io/badge/Terraform-000?style=for-the-badge&logo=terraform)
![AWS](https://img.shields.io/badge/AWS-000?style=for-the-badge&logo=amazon-aws)
![Node.js](https://img.shields.io/badge/Node.js-000?style=for-the-badge&logo=node.js)

# Description
A backend middleware service that syncs Shopify products with external systems, manages product data, order data,
and provides secure APIs for storefront integrations.
A IaaC (Infrastructure as a code) that sets up the overall cloud infrastructure with terraform . Manages multi environment setup for version management and uses various aws service to provide overall compute, storage and cloud management tools. 

# Services and tools 
- AWS
  - lambda
  - Api gateway
  - Dynamo DB
  - S3
  - Cloudfront
  - Cognito
- Terraform for IaC

# Folder structure
```tree
root/
├── amplify/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── api-gateway/
  ├── main.tf
  ├── blog.tf
  ├── contact-us.tf
  ├── fera.tf
  ├── personalizer.tf
  ├── search.tf
  ├── variables.tf
├── cloudfronts/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── cognito/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── dynamo/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── lambda/
  ├── functions/
  ├── layers/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── S3-buckets/
  ├── main.tf
  ├── output.tf
  ├── variables.tf
├── backend.tf
├── .tfvars
├── main.tf
├── provider.tf
├── variables.tf
├── .gitignore
└── Makefile
```
# Installation and working commands
1) Terraform
2) AWS account and IAM user setup
3) terraform init
4) terraform plan
5) terraform apply
