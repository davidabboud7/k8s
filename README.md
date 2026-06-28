# MiniLab - Kubernetes Microservices Project

A containerized microservices architecture project using Kubernetes, featuring an API service, background worker, PostgreSQL database, and Redis cache.

## 📋 Project Overview

MiniLab is a distributed application deployed on Kubernetes with the following components:

- **API Service**: Express.js REST API connected to PostgreSQL
- **Worker Service**: Background job processor using Redis
- **Database**: PostgreSQL with persistent storage
- **Cache**: Redis for inter-service communication and caching
- **Ingress**: HTTP routing for external access

## 🏗️ Architecture

```
┌─────────────┐
│   Ingress   │
└──────┬──────┘
       │
    ┌──┴──┐
    │     │
┌───▼──┐ ┌▼────────┐
│ API  │ │ Worker  │
└──┬───┘ └────┬────┘
   │          │
   └─────┬────┘
         │
    ┌────▼────┐
    │  Redis  │
    └────┬────┘
         │
    ┌────▼────────┐
    │  PostgreSQL │
    └─────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl CLI
- Node.js 18+ (for local development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/minilab.git
   cd minilab
   ```

2. **Deploy to Kubernetes**
   ```bash
   # Create namespace
   kubectl apply -f 00-namespace.yaml
   
   # Deploy all services (in order)
   kubectl apply -f 0*.yaml
   kubectl apply -f 1*.yaml
   ```

3. **Verify deployment**
   ```bash
   kubectl get pods -n minilab
   kubectl get svc -n minilab
   ```

## 📁 Project Structure

```
project1/
├── README.md                          # This file
├── 00-namespace.yaml                 # Kubernetes namespace
├── 01-postgres-secret.yaml           # PostgreSQL credentials
├── 02-postgres-pvc.yaml              # Persistent volume claim
├── 03-postgres-statefulset.yaml      # PostgreSQL deployment
├── 04-postgres-service.yaml          # PostgreSQL service
├── 05-redis-deployment.yaml          # Redis deployment
├── 06-redis-service.yaml             # Redis service
├── 07-api-configmap.yaml             # API configuration
├── 08-api-deployment.yaml            # API deployment
├── 09-api-service.yaml               # API service
├── 10-worker-deployment.yaml         # Worker deployment
├── 11-api-ingress.yaml               # Ingress controller
├── 12-postgres-networkpolicy.yaml    # Network policies
├── 13-worker-hpa.yaml                # Horizontal pod autoscaling
├── api/                              # API service
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
└── worker/                           # Background worker service
    ├── Dockerfile
    ├── index.js
    ├── package.json
    └── package-lock.json
```

## 📦 Services

### API Service (`api/`)
- **Framework**: Express.js
- **Dependencies**: Express, PostgreSQL driver (pg), Redis
- **Port**: 3000 (configured in deployment)
- **Role**: REST API for client requests

### Worker Service (`worker/`)
- **Dependencies**: Redis, Cheerio (HTML parsing)
- **Role**: Asynchronous job processing
- **Scaling**: Managed by HPA (Horizontal Pod Autoscaler)

### Database
- **Type**: PostgreSQL (StatefulSet)
- **Storage**: Persistent Volume
- **Credentials**: Stored in Secret resource

### Cache
- **Type**: Redis
- **Role**: Inter-service messaging and caching

## 🔧 Development

### Local Setup

```bash
# Install dependencies
cd api && npm install
cd ../worker && npm install

# Set up environment variables
# Create .env file with database and redis URLs
```

### Running Locally (Optional)

```bash
# Run API service
cd api
npm start

# Run worker (in separate terminal)
cd worker
npm start
```

## 🐳 Docker

Each service has a Dockerfile for containerization:

```bash
# Build API image
docker build -t minilab-api:latest ./api

# Build Worker image
docker build -t minilab-worker:latest ./worker
```

## ☸️ Kubernetes Configuration Files

- **00-namespace.yaml**: Creates isolated `minilab` namespace
- **01-postgres-secret.yaml**: Database credentials (⚠️ Use sealed-secrets or external secrets in production)
- **02-postgres-pvc.yaml**: Persistent storage for database
- **03-postgres-statefulset.yaml**: PostgreSQL deployment with ordered pod management
- **04-postgres-service.yaml**: Database service discovery
- **05-06**: Redis deployment and service
- **07**: API configuration (ConfigMap)
- **08-09**: API deployment and service
- **10**: Worker deployment
- **11**: Ingress for external HTTP routing
- **12**: Network policies for security
- **13**: HPA for worker auto-scaling

## 🔐 Security Considerations

### Current Issues & Recommendations:

1. **⚠️ Secrets Management**
   - ❌ Currently: Plain text secrets in YAML
   - ✅ Recommended: Use `sealed-secrets` or `external-secrets` operator

2. **🔒 Network Policies**
   - ✅ Good: Network policies exist
   - 💡 Ensure they're correctly restricting traffic

3. **🚫 RBAC**
   - ❌ Missing: Service accounts with proper RBAC rules
   - ✅ Recommended: Create least-privilege service accounts

## 📊 Monitoring & Logging

### Recommendations:

1. **Add Prometheus metrics**
   - Instrument API and Worker with prometheus client
   - Add ServiceMonitor for Kubernetes monitoring

2. **Centralized Logging**
   - Use ELK, Loki, or Cloud Logging
   - Structure logs as JSON for better parsing

3. **Health Checks**
   - Add `/health` endpoint to API
   - Implement readiness and liveness probes in deployments

## 🚀 Deployment

### Prerequisites for Production:

- [ ] Replace plain-text secrets with sealed-secrets
- [ ] Add resource requests/limits
- [ ] Implement health checks and probes
- [ ] Add logging and monitoring
- [ ] Set up proper CI/CD pipeline
- [ ] Use image registry (Docker Hub, ECR, GCR)
- [ ] Enable HTTPS/TLS on Ingress
- [ ] Add backup strategy for database

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f .

# Monitor deployment
kubectl rollout status deployment/api -n minilab
kubectl rollout status deployment/worker -n minilab

# Check logs
kubectl logs -f deployment/api -n minilab
kubectl logs -f deployment/worker -n minilab
```

## 🛠️ Troubleshooting

```bash
# Check pod status
kubectl get pods -n minilab -o wide

# View pod logs
kubectl logs <pod-name> -n minilab

# Describe pod for events
kubectl describe pod <pod-name> -n minilab

# Port forward to test locally
kubectl port-forward svc/api 3000:3000 -n minilab

# Test API endpoint
curl http://localhost:3000/health
```

## 📈 Next Steps & Improvements

### High Priority:
1. Add `.gitignore` file
2. Add `.dockerignore` files
3. Document environment variables
4. Implement health check endpoints
5. Add request/response validation
6. Add error handling and logging

### Medium Priority:
7. Add database migrations
8. Implement API authentication/authorization
9. Add unit and integration tests
10. Set up CI/CD pipeline (GitHub Actions)
11. Add prometheus metrics
12. Configure resource limits and requests

### Low Priority:
13. Add API documentation (Swagger/OpenAPI)
14. Implement distributed tracing (Jaeger)
15. Add service mesh (Istio) for advanced routing
16. Multi-stage Docker builds for optimization

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

David ABBOUD

## 📧 Contact

- Email: me@abbouddavid.com
- GitHub: [@davidabboud](https://github.com/davidabboud)
