data "http" "myip" {
  url = "https://ipv4.icanhazip.com"
}

output "value" {
  value = chomp(data.http.myip.response_body)
}
