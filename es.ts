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
