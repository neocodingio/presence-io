module "kms" {
  source      = "./modules/kms"
  bucket_name = var.bucket_name
}

module "s3" {
  source      = "./modules/s3"
  bucket_name = var.bucket_name
  kms_key_id  = module.kms.aws_kms_key_id
}
