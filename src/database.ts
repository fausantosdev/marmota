import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

if(!process.env.DATABASE_URL){
  throw new Error('DATABASE_URL env not found')
}

export const config: Knex.Config = {
  client: 'pg',
  connection: env.DATABASE_URL,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = setupKnex(config)
