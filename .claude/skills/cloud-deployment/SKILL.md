---
name: cloud-deployment
description: "Guide safe, scalable, and reproducible deployments. Defines environment configuration, secrets handling, CI/CD expectations, and rollback principles. Prohibits vendor lock-in, hardcoded secrets, and production shortcuts."
---

# Cloud & Deployment Skill

## Purpose

Guide safe, scalable, and reproducible deployments. This skill ensures that applications can be deployed consistently across environments, secrets are protected, and failures can be recovered from quickly.

## Core Principles

### What Cloud & Deployment Means

- **Reproducible** - Same artifact deploys identically across environments
- **Secure** - Secrets never in code, credentials properly managed
- **Observable** - Deployment status visible and metrics available
- **Recoverable** - Rollback capability for every deployment
- **Scalable** - Can handle increased load with configuration

### What Cloud & Deployment Is NOT

- **Vendor-specific** - Avoid lock-in to single cloud providers
- **Secret-laden** - No credentials in code or configuration files
- **Shortcut-prone** - Production deployments follow same process as staging
- **Fragile** - Deployments must be reliable and repeatable

---

## Environment Configuration

### Environment Types

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Local** | Development | Mocked/fake | Developer only |
| **Development** | Integration testing | Synthetic | Development team |
| **Staging** | Pre-production validation | Production-like | QA, Developers |
| **Production** | Live users | Real, anonymized | Operations only |

### Configuration File Structure

```yaml
# config/[environment].yaml

# Application Configuration
app:
  name: todo-app
  version: 1.0.0
  environment: development  # overridden by env var

# Service Endpoints (NOT credentials)
services:
  api:
    base_url: https://api.example.com
    timeout: 30000
    retry_attempts: 3
  database:
    host: localhost
    port: 5432
    name: todos_dev

# Feature Flags
features:
  dark_mode: true
  new_dashboard: false

# Rate Limiting
limits:
  max_todos_per_user: 1000
  api_rate_limit: 100
```

### Environment-Specific Overrides

```yaml
# config/development.yaml
app:
  log_level: debug
  environment: development

services:
  api:
    base_url: https://api-dev.example.com

# config/staging.yaml
app:
  log_level: info
  environment: staging

services:
  api:
    base_url: https://api-staging.example.com

# config/production.yaml
app:
  log_level: warn
  environment: production

services:
  api:
    base_url: https://api.example.com
```

### Environment Variable Rules

| Category | Variable | Source | Required |
|----------|----------|--------|----------|
| App Config | `APP_ENV` | System | Yes |
| App Config | `APP_LOG_LEVEL` | System | No (default: info) |
| Database | `DATABASE_URL` | Secrets | Yes |
| Secrets | `API_KEY` | Vault | Yes |
| Services | `EXTERNAL_SERVICE_URL` | Config | Yes |

### Twelve-Factor App Configuration

```typescript
// All configuration in environment variables
const config = {
  // Must be set by environment
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  serviceEndpoint: process.env.SERVICE_ENDPOINT,

  // Can have defaults, overridden by env
  port: parseInt(process.env.PORT || '3000'),
  logLevel: process.env.LOG_LEVEL || 'info',
};
```

---

## Secrets and Credentials Handling

### Secrets Definition

**Secrets are NOT**:

- Configuration files
- Hardcoded strings
- Environment templates (.env.example)
- Documentation

**Secrets ARE**:

- API keys and tokens
- Database passwords
- Encryption keys
- Service account credentials
- OAuth client secrets

### Secrets Storage Hierarchy

```
Most Secure → Least Secure

1. Hardware Security Module (HSM)
2. Cloud Key Management (AWS KMS, GCP Cloud KMS, Azure Key Vault)
3. Secret Management Service (HashiCorp Vault, AWS Secrets Manager)
4. Environment Variables (injected at runtime)
5. Configuration Files (encrypted at rest)
```

### Secrets Handling Rules

| Rule | Enforcement |
|------|-------------|
| **Never commit secrets** | Pre-commit hooks scanning |
| **Never log secrets** | Log filtering rules |
| **Never hardcode** | Code review required |
| **Rotate regularly** | Automated rotation policies |
| **Least privilege** | IAM policies with minimum permissions |
| **Audit access** | Logging of secret retrieval |

### Secrets Injection Pattern

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: todo-app:latest
          envFrom:
            - secretRef:
                name: todo-app-secrets
            - configMapRef:
                name: todo-app-config
```

### Environment-Specific Secrets

```bash
# .env (NEVER committed)
DATABASE_URL=postgresql://user:password@host:5432/db
API_KEY=sk-xxxxxxxxxxxxxxx
JWT_SECRET=your-jwt-secret-key
REDIS_PASSWORD=redis-password
```

```bash
# .env.example (committed, NO secrets)
DATABASE_URL=postgresql://user:PASSWORD@host:5432/db
API_KEY=YOUR_API_KEY_HERE
JWT_SECRET=YOUR_JWT_SECRET_HERE
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE
```

### Secrets Rotation Strategy

| Secret Type | Rotation Frequency | Automation |
|-------------|-------------------|------------|
| Database passwords | 90 days | Automated |
| API keys | 180 days | Semi-automated |
| JWT secrets | 30 days | Automated |
| Service accounts | 90 days | Manual approval |
| TLS certificates | 90 days | Automated (Let's Encrypt) |

---

## CI/CD Expectations

### Pipeline Stages

```mermaid
flowchart TD
    A[Commit Code] --> B[Build]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[Security Scan]
    E --> F[Build Container]
    F --> G[Push to Registry]
    G --> H[Deploy to Staging]
    H --> E2E[End-to-End Tests]
    E2E --> I[Deploy to Production]
    I --> J[Health Check]
    J --> K[Notify]
```

### Pipeline Definition

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.build.outputs.image }}
    steps:
      - uses: actions/checkout@v4

      - name: Build and test
        run: |
          npm ci
          npm run build
          npm test

      - name: Security scan
        run: |
          npm audit
          trivy image ${{ steps.build.outputs.image }}

      - name: Build and push image
        id: build
        run: |
          docker build -t $IMAGE_NAME:${{ github.sha }} .
          docker push $IMAGE_NAME:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/todo-app \
            todo-app=${{ needs.build.outputs.image }} \
            -n staging
          kubectl rollout status deployment/todo-app -n staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/todo-app \
            todo-app=${{ needs.build.outputs.image }} \
            -n production
          kubectl rollout status deployment/todo-app -n production
```

### Quality Gates

| Stage | Gate | Action on Fail |
|-------|------|----------------|
| Build | Compilation | Fail pipeline |
| Unit Tests | > 80% coverage | Fail pipeline |
| Security Scan | No critical CVEs | Fail pipeline |
| Integration | All tests pass | Fail pipeline |
| Staging Deploy | Health check pass | Rollback |
| Production Deploy | Health check pass | Rollback |

### Artifact Management

```
Artifacts/
├── images/
│   └── todo-app/
│       ├── sha-abc123 (latest)
│       ├── sha-def456
│       └── sha-ghi789
├── manifests/
│   └── releases/
│       ├── v1.0.0.yaml
│       └── v1.1.0.yaml
└── logs/
    └── deployment/
        ├── 2024-01-15T10-00-00Z.log
        └── 2024-01-15T11-00-00Z.log
```

---

## Rollback and Failure Recovery

### Rollback Strategy

```mermaid
flowchart TD
    A[Deployment Fails] --> B{Health Check Failed?}
    B -->|Yes| C[Automatic Rollback]
    B -->|No| D{Performance Degraded?}
    D -->|Yes| E[Manual Rollback Decision]
    D -->|No| F[Continue Deployment]
    C --> G[Restore Previous Version]
    E --> G
    G --> H[Notify Team]
    H --> I[Post-Mortem]
```

### Rollback Methods

| Method | Speed | Use Case |
|--------|-------|----------|
| **Image rollback** | Fast (seconds) | Container deployment |
| **Config rollback** | Fast (seconds) | Configuration change |
| **Database rollback** | Slow (minutes) | Schema migration |
| **Full restore** | Slow (minutes) | Major failure |

### Rollback Commands

```bash
# Kubernetes rollback
kubectl rollout undo deployment/todo-app -n production
kubectl rollout status deployment/todo-app -n production

# Previous known good version
kubectl rollout undo deployment/todo-app --to-revision=5 -n production

# Check rollout history
kubectl rollout history deployment/todo-app -n production
```

### Recovery Time Objectives

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|-------------------------------|-------------------------------|
| Complete outage | 15 minutes | 5 minutes |
| Performance degradation | 10 minutes | 5 minutes |
| Data corruption | 30 minutes | 0 (no data loss) |
| Security incident | 15 minutes | Depends on scope |

### Failure Detection

```yaml
# health-checks.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: health-checks
data:
  liveness-probe: |
    httpGet:
      path: /health/live
      port: 8080
    initialDelaySeconds: 10
    periodSeconds: 30
    timeoutSeconds: 5
    failureThreshold: 3

  readiness-probe: |
    httpGet:
      path: /health/ready
      port: 8080
    initialDelaySeconds: 5
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

  startup-probe: |
    httpGet:
      path: /health/startup
      port: 8080
    initialDelaySeconds: 0
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 30  # 5 minutes max startup
```

### Post-Mortem Template

```markdown
## Incident Post-Mortem

### Summary

| Field | Value |
|-------|-------|
| Incident ID | INC-2024-001 |
| Severity | High |
| Duration | 23 minutes |
| Impact | 15% of users affected |

### Timeline

| Time | Event |
|------|-------|
| 10:00 | Deployment started |
| 10:02 | Health checks failed |
| 10:05 | Automatic rollback initiated |
| 10:23 | Service fully restored |

### Root Cause

[Detailed explanation of what went wrong]

### Impact Analysis

- Users affected: [Number]
- Revenue impact: [Amount]
- Reputation impact: [Assessment]

### Resolution

[What was done to fix]

### Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
| Add additional health check | @developer | 2024-01-20 |
| Update runbook | @sre | 2024-01-18 |
| Improve test coverage | @qa | 2024-01-25 |

### Lessons Learned

- [What went well]
- [What went poorly]
- [Process improvements]
```

---

## Cloud-Native Best Practices

### Container Best Practices

```dockerfile
# Use specific version, not 'latest'
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY package*.json ./
RUN npm ci --only=production

# Copy source last (cache optimization)
COPY . .

# Non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose non-privileged port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
```

### Kubernetes Best Practices

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-app
  labels:
    app: todo-app
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: todo-app
  template:
    metadata:
      labels:
        app: todo-app
        version: v1
    spec:
      serviceAccountName: todo-app
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: todo-app
          image: todo-app:v1
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          envFrom:
            - secretRef:
                name: todo-secrets
            - configMapRef:
                name: todo-config
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

### Resource Management

| Resource | Request | Limit | Justification |
|----------|---------|-------|---------------|
| CPU | 100m | 500m | Average load requires 100m, burst to 500m |
| Memory | 128Mi | 256Mi | Application needs 128Mi base, 256Mi peak |
| Storage | 1Gi | N/A | Logs and temp data |

### Autoscaling

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## Multi-Cloud Considerations

### Avoiding Vendor Lock-In

| Component | Portable Approach | Avoid |
|-----------|------------------|-------|
| Compute | Containers, Kubernetes | AWS Lambda specific, Cloud Functions |
| Storage | S3-compatible, PostgreSQL | DynamoDB-specific, Cloud SQL specific |
| Message Queue | AMQP, MQTT | SQS-specific, Pub/Sub-specific |
| Secrets | HashiCorp Vault | AWS Secrets Manager, GCP Secret Manager |

### Abstraction Layer

```typescript
// Use abstraction, not direct SDK calls
interface StorageClient {
  upload(key: string, body: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

// Implement for each provider
class S3StorageClient implements StorageClient { }
class GCSStorageClient implements StorageClient { }
class AzureStorageClient implements StorageClient { }

// Use based on environment
const storageClient = createStorageClient();
```

### Infrastructure as Code

```hcl
# main.tf (portable)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Use variables for provider-specific values
variable "cloud_provider" {
  default = "aws"
}

variable "region" {
  default = "us-east-1"
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] Tests passing in CI
- [ ] Security scan passed (no critical CVEs)
- [ ] Documentation updated
- [ ] Configuration reviewed for environment
- [ ] Secrets rotated if needed
- [ ] Backup completed (if database change)
- [ ] Rollback plan verified
- [ ] Stakeholders notified

### During Deployment

- [ ] Deployment started with tracking
- [ ] Health checks passing
- [ ] Logs monitoring for errors
- [ ] Metrics dashboards visible
- [ ] Rollback ready if needed

### Post-Deployment

- [ ] Health checks passing
- [ ] Smoke tests passed
- [ ] No increase in error rates
- [ ] Performance within SLA
- [ ] Documentation updated with version
- [ ] Stakeholders notified of success
- [ ] Monitoring configured for new version

---

## Anti-Patterns

### Anti-Pattern 1: Hardcoded Secrets

**Forbidden**:

```typescript
// BAD: Secrets in code
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'production_password';
```

**Required**:

```typescript
// GOOD: Secrets from environment
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

### Anti-Pattern 2: Manual Configuration

**Forbidden**:

```bash
# BAD: Manual kubectl editing
kubectl edit deployment todo-app
# ... make changes in editor
```

**Required**:

```bash
# GOOD: Declarative configuration
kubectl apply -f deployment.yaml
# OR with Helm
helm upgrade todo-app ./chart --values values-prod.yaml
```

### Anti-Pattern 3: Same Process for All Environments

**Forbidden**:

```bash
# BAD: Different commands for different environments
npm run dev      # local
npm run stage    # staging
npm run prod     # production
```

**Required**:

```bash
# GOOD: Same process, different configuration
docker build -t todo-app:$VERSION .
docker tag todo-app:$VERSION $REGISTRY/todo-app:$VERSION
docker push $REGISTRY/todo-app:$VERSION
# Same deploy command for all environments
```

### Anti-Pattern 4: No Rollback Plan

**Forbidden**:

```yaml
# BAD: No previous image reference
spec:
  template:
    spec:
      containers:
        - name: app
          image: todo-app:latest  # No version!
```

**Required**:

```yaml
# GOOD: Versioned, with rollback capability
spec:
  template:
    spec:
      containers:
        - name: app
          image: todo-app:v1.2.3
  # Previous versions retained in registry
```

### Anti-Pattern 5: Prod Shortcuts

**Forbidden**:

```bash
# BAD: Direct production access for debugging
kubectl exec -it pod-xyz -n production -- /bin/bash
# Making changes directly in prod
```

**Required**:

```bash
# GOOD: Same process as development
# Use observability tools (logs, metrics) for debugging
kubectl logs pod-xyz -n production -f
# Make changes through CI/CD pipeline
```

---

## Security Checklist

### Deployment Security

| Check | Requirement | Verification |
|-------|-------------|--------------|
| Secrets | Never in code | Automated scan |
| TLS | All traffic encrypted | Security scan |
| RBAC | Least privilege | Policy review |
| Network | Restricted access | Firewall rules |
| Images | Scanned for CVEs | CI pipeline |
| Containers | Non-root user | Security scan |

### Compliance Considerations

| Standard | Key Requirements | Frequency |
|----------|-----------------|-----------|
| SOC 2 | Access logging, encryption | Annual audit |
| GDPR | Data privacy, deletion | Continuous |
| HIPAA | PHI protection | Annual audit |
| PCI DSS | Payment data security | Quarterly scan |

---

## Summary

Cloud and deployment best practices require:

1. **Environment isolation** - Separate configs for each environment
2. **Secret protection** - Never in code, properly injected
3. **CI/CD discipline** - Automated pipelines with quality gates
4. **Rollback capability** - Every deployment can be rolled back
5. **Observability** - Monitoring, logging, and alerting
6. **No vendor lock-in** - Portable, abstracted infrastructure
7. **No shortcuts** - Same process for all environments