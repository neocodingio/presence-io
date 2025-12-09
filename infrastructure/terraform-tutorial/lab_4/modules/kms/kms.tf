resource "aws_kms_key" "this" {
  description              = "KMS key for encrypting airbyte logs"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  is_enabled               = true
  enable_key_rotation      = true
  deletion_window_in_days  = 30
}

resource "aws_kms_alias" "this" {
  name          = "alias/ns-${var.bucket_name}-kms-key"
  target_key_id = aws_kms_key.this.key_id
}
