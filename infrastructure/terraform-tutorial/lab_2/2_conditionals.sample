terraform {
  required_version = ">= 1.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "local" {}

# Variables
variable "file_name_1" {
  type        = string
  description = "Name of the student"
  default     = "production_file"
  validation {
    condition     = can(regex("^[^ ]*$", var.file_name_1))
    error_message = "Spaces are not allowed in the file name."
  }
}

variable "file_name_2" {
  type        = string
  description = "Name of the student"
  default     = "staging_file"
  validation {
    condition     = can(regex("^[^ ]*$", var.file_name_2))
    error_message = "Spaces are not allowed in the file name."
  }
}

variable "is_production" {
  type        = bool
  description = "Is production"
  default     = false
}

# Create a file by with condition
resource "local_file" "create_file" {
  filename = var.is_production ? "${path.module}/${var.file_name_1}.txt" : "${path.module}/${var.file_name_2}.txt"
  content  = "This is a sample file"
}
