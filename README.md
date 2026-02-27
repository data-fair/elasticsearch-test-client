# Elasticsearch Test Client

Debug Docker image for testing Elasticsearch connectivity from a Kubernetes pod.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ES_HOST` | Single ES host (e.g., `localhost:9200`) |
| `ES_NODES` | JSON array of ES nodes |
| `ES_AUTH` | JSON object with `username` and `password` |
| `ES_OPTIONS` | JSON object with additional client options |
| `ES_CA` | CA certificate string |

## Usage

```bash
# Build
docker build -t es-test-client .

# Run
docker run -it -e ES_HOST=localhost:9200 es-test-client
```

## Kubernetes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: es-test-client
spec:
  containers:
  - name: es-test-client
    image: es-test-client
    env:
    - name: ES_HOST
      value: "elasticsearch:9200"
  restartPolicy: Never
```

## Connect to Pod

```bash
kubectl exec -it es-test-client -- sh
# Then run node scripts using the es client:
node --loader ts-node/esm -e "import { esClient } from './es.js'; await esClient.connect(); console.log(await esClient.client.cat.indices())"
```
