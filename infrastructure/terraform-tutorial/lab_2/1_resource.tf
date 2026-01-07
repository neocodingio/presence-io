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

# validation {
#   condition     = can(regex("^[^ ]*$", var.file_name))
#   error_message = "Spaces are not allowed in the file name."
# }

# Variable
variable "file_name" {
  type        = string
  description = "Name of the student"
  default     = "new_file"
  validation {
    condition     = can(regex("^[^ ]*$", var.file_name))
    error_message = "Spaces are not allowed in the file name."
  }