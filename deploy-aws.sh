#!/bin/bash

# SynapseTrade AI™ - AWS Deployment Script
# Chief Technical Architect Implementation

echo "🚀 STARTING AWS DEPLOYMENT FOR SYNAPSETRADE AI™"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="SynapseTrade-AI-Stack"
DOMAIN_NAME="synapsetrade.ai"
REGION="us-east-1"
PROFILE="default"

# Diagnostic function
diagnostic() {
    echo -e "${BLUE}[DIAGNOSTIC]${NC} $1"
}

# Success function
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Error function
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Warning function
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check AWS CLI
check_aws_cli() {
    diagnostic "Checking AWS CLI installation..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
        echo "Install AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    success "AWS CLI is installed"
    
    # Check AWS credentials
    diagnostic "Checking AWS credentials..."
    if ! aws sts get-caller-identity --profile $PROFILE > /dev/null 2>&1; then
        error "AWS credentials not configured"
        echo "Configure AWS credentials: aws configure"
        exit 1
    fi
    
    success "AWS credentials configured"
}

# Check Docker
check_docker() {
    diagnostic "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    success "Docker is installed"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        echo "Start Docker service"
        exit 1
    fi
    
    success "Docker is running"
}

# Build and push Docker images
build_and_push_images() {
    diagnostic "Building and pushing Docker images..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile $PROFILE)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
    
    # Login to ECR
    diagnostic "Logging into ECR..."
    aws ecr get-login-password --region $REGION --profile $PROFILE | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Create ECR repository if it doesn't exist
    diagnostic "Creating ECR repository..."
    aws ecr create-repository --repository-name synapsetrade-ai-backend --region $REGION --profile $PROFILE || true
    
    # Build backend image
    diagnostic "Building backend Docker image..."
    cd backend
    
    cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Run application
CMD ["python", "server.py"]
EOF
    
    docker build -t synapsetrade-ai-backend .
    docker tag synapsetrade-ai-backend:latest $ECR_REGISTRY/synapsetrade-ai-backend:latest
    docker push $ECR_REGISTRY/synapsetrade-ai-backend:latest
    
    success "Backend image built and pushed"
    
    cd ..
}

# Build frontend
build_frontend() {
    diagnostic "Building frontend for S3..."
    
    cd frontend
    
    # Create production environment
    cat > .env.production << EOF
REACT_APP_BACKEND_URL=https://api.${DOMAIN_NAME}
REACT_APP_GOOGLE_CLIENT_ID=826981107429-bfninoa6irpb4ptomn0m637hphoh2t83.apps.googleusercontent.com
REACT_APP_GITHUB_CLIENT_ID=Ov23lisfYEmX0dRrr8wN
EOF
    
    # Build React app
    npm run build
    
    success "Frontend built successfully"
    
    cd ..
}

# Deploy CloudFormation stack
deploy_cloudformation() {
    diagnostic "Deploying CloudFormation stack..."
    
    # Read API keys from environment or prompt
    read -p "Enter OpenAI API Key: " -s OPENAI_API_KEY
    echo ""
    read -p "Enter Claude API Key: " -s CLAUDE_API_KEY
    echo ""
    read -p "Enter Gemini API Key: " -s GEMINI_API_KEY
    echo ""
    
    aws cloudformation deploy \
        --template-file aws-cloudformation.yml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            Environment=production \
            DomainName=$DOMAIN_NAME \
            OpenAIApiKey=$OPENAI_API_KEY \
            ClaudeApiKey=$CLAUDE_API_KEY \
            GeminiApiKey=$GEMINI_API_KEY \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --profile $PROFILE
    
    if [ $? -eq 0 ]; then
        success "CloudFormation stack deployed successfully"
    else
        error "CloudFormation deployment failed"
        exit 1
    fi
}

# Upload frontend to S3
upload_frontend() {
    diagnostic "Uploading frontend to S3..."
    
    # Get S3 bucket name from CloudFormation output
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
        --output text \
        --region $REGION \
        --profile $PROFILE)
    
    if [ -z "$BUCKET_NAME" ]; then
        error "Could not get S3 bucket name"
        exit 1
    fi
    
    # Upload build files
    aws s3 sync frontend/build/ s3://$BUCKET_NAME/ --delete --region $REGION --profile $PROFILE
    
    success "Frontend uploaded to S3"
}

# Create CloudFront invalidation
invalidate_cloudfront() {
    diagnostic "Creating CloudFront invalidation..."
    
    # Get CloudFront distribution ID
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionDNS`].OutputValue' \
        --output text \
        --region $REGION \
        --profile $PROFILE)
    
    if [ -z "$DISTRIBUTION_ID" ]; then
        warning "Could not get CloudFront distribution ID"
        return
    fi
    
    # Create invalidation
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --region $REGION \
        --profile $PROFILE
    
    success "CloudFront invalidation created"
}

# Update ECS service
update_ecs_service() {
    diagnostic "Updating ECS service..."
    
    # Get ECS cluster name
    CLUSTER_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
        --output text \
        --region $REGION \
        --profile $PROFILE)
    
    if [ -z "$CLUSTER_NAME" ]; then
        error "Could not get ECS cluster name"
        exit 1
    fi
    
    # Force new deployment
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service synapsetrade-ai-backend \
        --force-new-deployment \
        --region $REGION \
        --profile $PROFILE
    
    success "ECS service updated"
}

# Wait for deployment
wait_for_deployment() {
    diagnostic "Waiting for deployment to complete..."
    
    # Wait for ECS service to be stable
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services synapsetrade-ai-backend \
        --region $REGION \
        --profile $PROFILE
    
    success "Deployment completed"
}

# Run health checks
run_health_checks() {
    diagnostic "Running health checks..."
    
    # Get ALB DNS name
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`ApplicationLoadBalancerDNS`].OutputValue' \
        --output text \
        --region $REGION \
        --profile $PROFILE)
    
    if [ -z "$ALB_DNS" ]; then
        error "Could not get ALB DNS name"
        exit 1
    fi
    
    # Test backend health
    diagnostic "Testing backend health..."
    for i in {1..5}; do
        if curl -f http://$ALB_DNS/api/health > /dev/null 2>&1; then
            success "Backend health check passed"
            break
        else
            warning "Backend health check failed, retrying in 10s..."
            sleep 10
        fi
    done
    
    # Test frontend
    diagnostic "Testing frontend..."
    if curl -f https://$DOMAIN_NAME > /dev/null 2>&1; then
        success "Frontend accessible"
    else
        warning "Frontend not accessible yet (DNS propagation may take time)"
    fi
}

# Main deployment function
main() {
    echo "🎯 CHIEF TECHNICAL ARCHITECT - AWS DEPLOYMENT PROTOCOL"
    echo "======================================================"
    
    # Pre-deployment checks
    check_aws_cli
    check_docker
    
    # Build and deploy
    build_and_push_images
    build_frontend
    deploy_cloudformation
    upload_frontend
    invalidate_cloudfront
    update_ecs_service
    wait_for_deployment
    run_health_checks
    
    echo ""
    echo "🎉 AWS DEPLOYMENT COMPLETE!"
    echo "=========================="
    success "SynapseTrade AI™ deployed successfully"
    success "Frontend: https://$DOMAIN_NAME"
    success "Backend: https://api.$DOMAIN_NAME"
    
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "- Frontend: S3 + CloudFront CDN"
    echo "- Backend: ECS Fargate + Application Load Balancer"
    echo "- Database: MongoDB Atlas (configure separately)"
    echo "- SSL: ACM Certificate"
    echo "- DNS: Route 53"
    echo "- Monitoring: CloudWatch"
    echo "- Auto Scaling: ECS Service Auto Scaling"
    echo "- Security: VPC, Security Groups, IAM Roles"
    
    echo ""
    echo "🔧 POST-DEPLOYMENT TASKS:"
    echo "1. Configure MongoDB Atlas connection string"
    echo "2. Update OAuth redirect URLs"
    echo "3. Set up monitoring dashboards"
    echo "4. Configure alerts"
    echo "5. Test all functionality"
    
    echo ""
    success "AWS deployment completed successfully!"
}

# Run main function
main "$@"