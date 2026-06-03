# Kubernetes Configuration

## Quick Start

### Pull the latest image

```bash
docker pull ghcr.io/reynadi531/tubes-cc-fe:main
```

### Dont forget to change direcotry to `tubes-fe/infra/k8s`

```bash
cd ./infra/k8s
```

### Apply the Kubernetes resources

```bash
# Apply all resources
kubectl apply -k .

# Or apply individually
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### 5. Verify Deployment
```bash
# Check namespace
kubectl get namespace yuki-fe

# Check pods
kubectl get pods -n yuki-fe

# Check services
kubectl get svc -n yuki-fe

# Check ingress
kubectl get ingress -n yuki-fe

# View logs
kubectl logs -f deployment/yuki-fe -n yuki-fe
```

## Access

The Ingress is configured for `tubes-fe.local`. Add to `/etc/hosts`:

```
127.0.0.1 yuki-fe.local
```

Or

Use this command to port forward

```bash
kubectl port-forward svc/yuki-fe 80:80 -n yuki-fe
```


## Production Checklist

- [ ] Change `imagePullPolicy` to `Always` and use a real registry
- [ ] Add TLS to Ingress via cert-manager
- [ ] Configure resource limits based on actual usage
- [ ] Add HorizontalPodAutoscaler for scaling
- [ ] Set up NetworkPolicy for isolation
- [ ] Configure PodDisruptionBudget for availability
