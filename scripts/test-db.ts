import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    console.log('Testing database connection...')
    
    // Try to query users
    const users = await prisma.user.findMany()
    console.log('Current users in database:', users)
    
    // Try to query sessions
    const sessions = await prisma.session.findMany()
    console.log('Current sessions in database:', sessions)
    
  } catch (error) {
    console.error('Error testing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 