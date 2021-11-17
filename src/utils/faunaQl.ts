import { query as q } from 'faunadb'

export const userByEmail = (email: string) =>
  q.Match(q.Index('user_by_email'), q.Casefold(email))
