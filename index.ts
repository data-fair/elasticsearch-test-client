import es from './es.ts'

async function main () {
  console.log('Connecting to Elasticsearch...')
  await es.connect()

  console.log('Performing health check...')
  const health = await es.client.cluster.health()
  console.log('', )

  console.log(`
Cluster health: ${JSON.stringify(health, null, 2)}

Elasticsearch client is ready! You can now run your own scripts.

Example:

  const es = require('./es.ts')
  await es.connect()
  await es.client.indices.stats()
`)
  console.log('')
  console.log('')
  console.log('')
  console.log('Example: import { esClient } from "./es.ts"')
  console.log('')

  while(true) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

main().catch(err => {
  console.error('Failed to connect to Elasticsearch:', err)
  process.exit(1)
})
