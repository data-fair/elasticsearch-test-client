import { esClient } from './es.ts'

async function main () {
  console.log('Connecting to Elasticsearch...')
  await esClient.connect()

  console.log('Performing health check...')
  const health = await esClient.client.cluster.health()
  console.log('Cluster health:', JSON.stringify(health, null, 2))

  console.log('')
  console.log('Elasticsearch client is ready!')
  console.log('You can now run your own scripts.')
  console.log('Example: import { esClient } from "./es.js"')
  console.log('')

  while(true) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

main().catch(err => {
  console.error('Failed to connect to Elasticsearch:', err)
  process.exit(1)
})
