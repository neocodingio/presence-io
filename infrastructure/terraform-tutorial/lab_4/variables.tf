variable "is_public" {
  type    = bool
  default = false
}

variable "ec2_name" {
  type        = string
  description = "Name for the bucket."
  default     = "terraform-tutorial-ec2"
}
