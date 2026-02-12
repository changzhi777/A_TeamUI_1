import { createIndexes } from '../config/indexes'

async function main() {
  console.log('🔧 Creating database indexes...\n')
  await createIndexes()
  console.log('\n✅ Indexes created successfully')
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Error creating indexes:', error)
  process.exit(1)
})
