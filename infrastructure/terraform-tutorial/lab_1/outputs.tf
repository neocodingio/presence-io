output "welcome_message" {
  description = "Hello world message"
  value       = "Welcome ${var.student_name} to Hello World Lesson ${var.lesson_number}"
}

output "topics_list" {
  description = "Topics covered in this lesson"
  value       = var.topics
}
