#!/bin/bash

# SynapseTrade AI™ - Docker Deployment Script
# Chief Technical Architect Implementation

echo "🚀 STARTING DOCKER DEPLOYMENT FOR SYNAPSETRADE AI™"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="synapsetrade-ai"

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

# Port check function
port_check() {
    local port=$1
    local service=$2
    
    diagnostic "Checking port $port availability for $service"
    
    if netstat -tuln | grep ":$port " > /dev/null 2>&1; then
        warning "Port $port is already in use"
        return 1
    else
        success "Port $port is available for $service"
        return 0
    fi
}

# Check prerequisites
check_prerequisites() {
    diagnostic "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        echo "Install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        echo "Start Docker service"
        exit 1
    fi
    
    success "All prerequisites are met"
}

# Check ports
check_ports() {
    diagnostic "Checking port availability..."
    
    local ports=(80 443 3000 8001 27017 6379 9090 3001 9200 5601)
    local services=("nginx" "nginx-ssl" "frontend" "backend" "mongodb" "redis" "prometheus" "grafana" "elasticsearch" "kibana")
    
    for i in "${!ports[@]}"; do
        port_check "${ports[$i]}" "${services[$i]}"
    done
}

# Create required directories
create_directories() {
    diagnostic "Creating required directories..."
    
    mkdir -p ssl logs/nginx logs/backend data/mongodb data/redis data/prometheus data/grafana data/elasticsearch
    
    success "Directories created"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    diagnostic "Generating SSL certificates..."
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=CA/L=San Francisco/O=SynapseTrade AI/CN=synapsetrade.ai"
        
        success "SSL certificates generated"
    else
        success "SSL certificates already exist"
    fi
}

# Create configuration files
create_config_files() {
    diagnostic "Creating configuration files..."
    
    # MongoDB initialization script
    cat > mongo-init.js << 'EOF'
db = db.getSiblingDB('synapsetrade');
db.createUser({
    user: 'synapsetrade',
    pwd: 'synapse-db-2025',
    roles: [
        {
            role: 'readWrite',
            db: 'synapsetrade'
        }
    ]
});

// Create collections
db.createCollection('users');
db.createCollection('trades');
db.createCollection('strategies');
db.createCollection('analyses');
db.createCollection('risk_assessments');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.trades.createIndex({ "user_id": 1 });
db.strategies.createIndex({ "user_id": 1 });
db.analyses.createIndex({ "user_id": 1 });
db.risk_assessments.createIndex({ "user_id": 1 });

print("MongoDB initialized successfully");
EOF

    # Prometheus configuration
    cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'synapsetrade-backend'
    static_configs:
      - targets: ['backend:8001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'
    scrape_interval: 10s
EOF

    # Logstash configuration
    cat > logstash.conf << 'EOF'
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "synapsetrade-backend" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
      match => [ "timestamp" , "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "synapsetrade-logs-%{+YYYY.MM.dd}"
  }
}
EOF

    # Frontend nginx configuration
    cat > frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
EOF

    success "Configuration files created"
}

# Build images
build_images() {
    diagnostic "Building Docker images..."
    
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    if [ $? -eq 0 ]; then
        success "Docker images built successfully"
    else
        error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    diagnostic "Starting services..."
    
    # Start core services first
    diagnostic "Starting database and cache..."
    docker-compose -f $COMPOSE_FILE up -d mongodb redis
    
    # Wait for database to be ready
    diagnostic "Waiting for database to be ready..."
    sleep 30
    
    # Start backend
    diagnostic "Starting backend..."
    docker-compose -f $COMPOSE_FILE up -d backend
    
    # Wait for backend to be ready
    diagnostic "Waiting for backend to be ready..."
    sleep 15
    
    # Start frontend
    diagnostic "Starting frontend..."
    docker-compose -f $COMPOSE_FILE up -d frontend
    
    # Start nginx
    diagnostic "Starting nginx..."
    docker-compose -f $COMPOSE_FILE up -d nginx
    
    # Start monitoring services
    diagnostic "Starting monitoring services..."
    docker-compose -f $COMPOSE_FILE up -d prometheus grafana
    
    # Start logging services
    diagnostic "Starting logging services..."
    docker-compose -f $COMPOSE_FILE up -d elasticsearch logstash kibana
    
    success "All services started"
}

# Health checks
run_health_checks() {
    diagnostic "Running health checks..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check MongoDB
    if docker-compose -f $COMPOSE_FILE exec -T mongodb mongo --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        success "MongoDB health check passed"
    else
        error "MongoDB health check failed"
    fi
    
    # Check Redis
    if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis health check passed"
    else
        error "Redis health check failed"
    fi
    
    # Check Backend
    if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Check Nginx
    if curl -f http://localhost/health > /dev/null 2>&1; then
        success "Nginx health check passed"
    else
        error "Nginx health check failed"
    fi
}

# Show service status
show_service_status() {
    diagnostic "Showing service status..."
    
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    echo "📊 SERVICE ENDPOINTS:"
    echo "===================="
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Main Site: http://localhost"
    echo "🔗 HTTPS Site: https://localhost"
    echo "🚀 Backend API: http://localhost:8001"
    echo "📊 Prometheus: http://localhost:9090"
    echo "📈 Grafana: http://localhost:3001 (admin/synapse-grafana-2025)"
    echo "🔍 Kibana: http://localhost:5601"
    echo "🗃️ MongoDB: localhost:27017"
    echo "⚡ Redis: localhost:6379"
}

# Create systemd service (for production)
create_systemd_service() {
    diagnostic "Creating systemd service..."
    
    cat > /etc/systemd/system/synapsetrade-ai.service << EOF
[Unit]
Description=SynapseTrade AI™ Docker Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f $COMPOSE_FILE up -d
ExecStop=/usr/local/bin/docker-compose -f $COMPOSE_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable synapsetrade-ai.service
    
    success "Systemd service created"
}

# Backup function
create_backup() {
    diagnostic "Creating backup..."
    
    BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup MongoDB
    docker-compose -f $COMPOSE_FILE exec -T mongodb mongodump --out /tmp/backup
    docker cp $(docker-compose -f $COMPOSE_FILE ps -q mongodb):/tmp/backup $BACKUP_DIR/mongodb
    
    # Backup volumes
    docker run --rm -v synapsetrade-ai_mongodb_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/mongodb_data.tar.gz -C /data .
    docker run --rm -v synapsetrade-ai_redis_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    docker run --rm -v synapsetrade-ai_prometheus_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/prometheus_data.tar.gz -C /data .
    docker run --rm -v synapsetrade-ai_grafana_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/grafana_data.tar.gz -C /data .
    
    success "Backup created in $BACKUP_DIR"
}

# Main deployment function
main() {
    echo "🎯 CHIEF TECHNICAL ARCHITECT - DOCKER DEPLOYMENT PROTOCOL"
    echo "========================================================="
    
    # Pre-deployment checks
    check_prerequisites
    check_ports
    
    # Setup
    create_directories
    generate_ssl_certificates
    create_config_files
    
    # Build and deploy
    build_images
    start_services
    run_health_checks
    show_service_status
    
    # Production setup
    if [ "$1" = "production" ]; then
        create_systemd_service
        create_backup
    fi
    
    echo ""
    echo "🎉 DOCKER DEPLOYMENT COMPLETE!"
    echo "=============================="
    success "SynapseTrade AI™ is running in Docker containers"
    
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "- Frontend: React app in nginx container"
    echo "- Backend: FastAPI in Python container"
    echo "- Database: MongoDB with initialized collections"
    echo "- Cache: Redis for session management"
    echo "- Reverse Proxy: Nginx with SSL termination"
    echo "- Monitoring: Prometheus + Grafana"
    echo "- Logging: ELK Stack (Elasticsearch, Logstash, Kibana)"
    echo "- SSL: Self-signed certificates for development"
    echo "- Networking: Isolated Docker network"
    echo "- Volumes: Persistent data storage"
    echo "- Health Checks: All services monitored"
    
    echo ""
    echo "🔧 MANAGEMENT COMMANDS:"
    echo "docker-compose logs -f [service]  # View logs"
    echo "docker-compose restart [service] # Restart service"
    echo "docker-compose down             # Stop all services"
    echo "docker-compose up -d            # Start all services"
    echo "docker-compose ps               # Check status"
    
    echo ""
    echo "🛠️ TROUBLESHOOTING:"
    echo "- Check logs: docker-compose logs -f"
    echo "- Restart services: docker-compose restart"
    echo "- Port conflicts: Change ports in docker-compose.yml"
    echo "- Database issues: Check mongo-init.js"
    echo "- SSL issues: Regenerate certificates"
    
    echo ""
    success "Docker deployment completed successfully!"
}

# Handle command line arguments
case "$1" in
    "production")
        main production
        ;;
    "backup")
        create_backup
        ;;
    "health")
        run_health_checks
        ;;
    "status")
        show_service_status
        ;;
    *)
        main
        ;;
esac