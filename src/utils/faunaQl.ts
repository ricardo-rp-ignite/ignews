import { query as q } from 'faunadb'

export const userByEmail = (email: string) =>
  q.Match(q.Index('user_by_email'), q.Casefold(email))

export const userByStripeCustomerId = (customerId: string) =>
  q.Match(q.Index('user_by_stripe_customer_id'), customerId)
