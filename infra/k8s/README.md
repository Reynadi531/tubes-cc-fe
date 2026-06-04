# Kubernetes Configuration

## Default deployment flow

This directory is designed for a port-forward-first workflow. You do not need an ingress controller or `/etc/hosts` changes for the default local verification path.

### 1. Build and push the image

```bash
docker build -t ghcr.io/reynadi531/tubes-cc-fe:latest .
docker push ghcr.io/reynadi531/tubes-cc-fe:latest
```

### 2. Create the runtime config secret and apply the manifests

From the repository root:

```bash
kubectl create secret generic yuki-fe-env \
  --namespace tubes-fe \
  --from-literal=VITE_SERVER_URL=http://your-api-host:8000 \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -k infra/k8s
```

### 3. Verify the deployment

```bash
kubectl get namespace tubes-fe
kubectl get deployment,pods,svc -n tubes-fe
kubectl logs -f deployment/tubes-fe -n tubes-fe
```

### 4. Access the app

```bash
kubectl port-forward svc/tubes-fe 8080:80 -n tubes-fe
```

Then open `http://127.0.0.1:8080`.

## Optional ingress access

An ingress manifest is included and routes `tubes-fe.local` to the `tubes-fe` service on the `http` port. This is optional and only useful if your cluster already has a compatible ingress controller, such as nginx.

If you choose to use ingress, point `tubes-fe.local` at your ingress entrypoint and verify the ingress resource:

```bash
kubectl get ingress -n tubes-fe
```

## Runtime contract

- Image: `ghcr.io/reynadi531/tubes-cc-fe:latest`
- Container port: `8080`
- Service port: `80`
- Namespace: `tubes-fe`

- Runtime API URL secret: `tubes-fe-web-env` / `VITE_SERVER_URL`

## Production checklist

- [ ] Change `imagePullPolicy` to `Always` and use an immutable image tag
- [ ] Add TLS to ingress via cert-manager or your cluster ingress solution
- [ ] Configure resource limits based on actual usage
- [ ] Add HorizontalPodAutoscaler if needed
- [ ] Set up NetworkPolicy for isolation
- [ ] Configure PodDisruptionBudget for availability
