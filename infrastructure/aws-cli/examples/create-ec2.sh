#https://docs.aws.amazon.com/cli/latest/userguide/cli-services-ec2-sg.html

aws ec2 describe-images --region us-east-1 --owners amazon --filters 'Name=name,Values=al2023-ami-2023.*-x86_64' \
--query 'reverse(sort_by(Images, &CreationDate))[:1].ImageId' --output text --profile devops-class

aws ec2 create-security-group --group-name MySecurityGroup --description "My security group" --vpc-id vpc-1a2b3c4d

curl https://checkip.amazonaws.com

aws ec2 authorize-security-group-ingress --group-id sg-903004f8 --protocol tcp --port 3389 --cidr x.x.x.x/x

#aws ec2 delete-security-group --group-id sg-903004f8

aws ec2 run-instances --image-id $image_id --instance-type t2.micro \
--security-group-ids <sg-id> --subnet-id <subnet-id> --profile devops-class --region us-east-1

aws ec2 run-instances --image-id $image_id --instance-type t2.micro --key-name vockey \
--security-group-ids <sg-id> --subnet-id <subnet-id> --profile devops-class --region us-east-1

aws ec2 associate-iam-instance-profile \
    --instance-id i-0cc9450cc48ded4cb \
    --iam-instance-profile Name="myS3Role" --profile devops-class --region us-east-1