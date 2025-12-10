variable "bucket_name" {
  type        = string
  description = "S3 bucket name"
  default     = "terraform-tutorial-mta-bucket"

  validation {
    condition = (
      length(var.bucket_name) >= 3 &&
      length(var.bucket_name) <= 63 &&
      can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.bucket_name))
    )
    error_message = "Bucket name must be 3–63 chars, lowercase letters, numbers, dots, hyphens; start/end with letter or number."
  }
}
