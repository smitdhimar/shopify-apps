# AWS Terraform Practice
A collection of Terraform configurations for deploying scalable AWS infrastructure (Lambda, API Gateway, DynamoDB, S3).

# Tech stack
![Terraform](https://img.shields.io/badge/Terraform-000?style=for-the-badge&logo=terraform)
![AWS](https://img.shields.io/badge/AWS-000?style=for-the-badge&logo=amazon-aws)
![Node.js](https://img.shields.io/badge/Node.js-000?style=for-the-badge&logo=node.js)

# Description
A backend middleware service that syncs Shopify products with external systems, manages product data, inventory,
and provides secure APIs for storefront integrations.
A IaaC (Infrastructure as a code) that sets up the overall cloud infrastructure with terraform . Manages multi environment setup for version management and uses various aws service to provide overall compute, storage and cloud management tools. 

# Services and tools 
- AWS
  - Budgets
  - EC2
  - lambda
  - Api gateway
  - Resource explorer
  - SNS
  - VPC
  - Dynamo DB
  - RDS
  - S3
- Terraform for IaC

# Folder structure
```tree
root/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── prod/
├── modules/
│   ├── billing_cost_budget/
│   │   └── budgets/
│   ├── compute/
│   │   ├── ec2/
│   │   └── lambda/
│   ├── miscellaneous_service/
│   │   ├── api_gateway/
│   │   ├── resource_explorer/
│   │   └── sns/
│   ├── network/
│   │   ├── security_groups/
│   │   └── vpc/
│   └── storage/
│       ├── dynamoDB/
│       ├── rds/
│       └── s3/
├── .gitignore
└── Makefile
```
# Installation and working commands
1) Terraform
2) AWS account and IAM user setup
3) terraform init
4) terraform plan
5) terraform apply
