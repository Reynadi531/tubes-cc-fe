# Kubernetes Configuration

## Quick Start

## Pull the latest image

```bash
docker pull ghcr.io/reynadi531/tubes-cc-fe:latest
```

```bash
# Apply all resources
kubectl apply -k .

# Or apply individually
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
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
