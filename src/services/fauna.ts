import { Client } from 'faunadb'

// DO NOT IMPORT THIS IN CLIENT-SIDE ROUTES.

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY,
})
