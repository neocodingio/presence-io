variable "student_name" {
  type        = string
  description = "Name of the student"
  default     = "Terragomi"
}

variable "lesson_number" {
  type        = number
  description = "Current lesson number"
  default     = 1
}

variable "topics" {
  type        = list(string)
  description = "Topics covered in this lesson"
  default     = ["variables", "outputs"]
}

locals {
  topics_list = ["variables", "outputs"]
}
