terraform {
  cloud {
    organization = "shopify-headless"

    workspaces {
      name = "cello"
    }
  }

  required_version = ">= 1.1.2"
}

