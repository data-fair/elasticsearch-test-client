import elasticsearch, { type ClientOptions, type Client } from '@elastic/elasticsearch'

interface ElasticsearchConfig {
  host?: string
  nodes?: string | string[]
  auth?: { username: string; password: string }
  options?: ClientOptions
  ca?: string
}

function getConfig (): ElasticsearchConfig {
  const config: ElasticsearchConfig = {}

  if (process.env.ES_HOST) {
    let host = process.env.ES_HOST
    if (!host.startsWith('http')) host = 'http://' + host
    config.host = host
  }

  if (process.env.ES_NODES) {
    try {
      config.nodes = JSON.parse(process.env.ES_NODES)
    } catch {
      config.nodes = process.env.ES_NODES
    }
  }

  if (process.env.ES_AUTH) {
    try {
      config.auth = JSON.parse(process.env.ES_AUTH)
    } catch {
      config.auth = undefined
    }
  }

  if (process.env.ES_OPTIONS) {
    try {
      config.options = JSON.parse(process.env.ES_OPTIONS)
    } catch {
      config.options = {}
    }
  }

  if (process.env.ES_CA) {
    config.ca = process.env.ES_CA
  }

  return config
}

export class EsClient {
  private _client?: Client

  get client () {
    if (!this._client) throw new Error('Elasticsearch client was not connected')
    return this._client
  }

  async connect () {
    const config = getConfig()

    let node = config.nodes
    if (!node) {
      node = config.host
    }

    const options: ClientOptions = {
      node,
      auth: config.auth,
      ...config.options
    }

    if (config.ca) {
      options.tls = options.tls ?? {}
      options.tls.ca = config.ca
    }

    const client = new elasticsearch.Client(options)

    try {
      await client.ping()
      console.log('Elasticsearch cluster is reachable')
    } catch (err) {
      console.log('First ping failed, retrying after 2s...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      await client.ping()
      console.log('Elasticsearch cluster is reachable after retry')
    }

    this._client = client
  }
}

export const esClient = new EsClient()
export default esClient

// drain, usually before removal
export async function drainNode(nodeName: string) {
  try {
    console.log(`Starting drain process for node: ${nodeName}...`);

    const response = await esClient.client.cluster.putSettings({
      body: {
        transient: {
          // This tells ES to exclude this specific node from shard allocation
          "cluster.routing.allocation.exclude._name": nodeName
        }
      }
    });

    console.log('Setting updated successfully:', response);
    console.log('The cluster is now moving shards off the node.');
    
  } catch (error) {
    console.error('Error cordoning node:', error);
  }
}

// toggle allocation in the cluster during upgrades
export async function toggleAllocation(status: 'on' | 'primaries') {
  // status should be 'all' (enabled) or 'primaries'/'none' (disabled)
  try {
    await esClient.client.cluster.putSettings({
      body: {
        transient: {
          "cluster.routing.allocation.enable": status
        }
      }
    });
    console.log(`Shard allocation set to: ${status}`);
  } catch (err) {
    console.error('Failed to update settings:', err);
  }
}


