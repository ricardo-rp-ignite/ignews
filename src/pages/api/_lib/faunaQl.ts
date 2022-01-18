import { Expr, query as q } from 'faunadb'

export function userByEmail(userEmail: string): Expr {
  return q.Match(q.Index('user_by_email'), q.Casefold(userEmail))
}

export function userByStripeCustomerId(customerId: string): Expr {
  return q.Match(q.Index('user_by_stripe_customer_id'), customerId)
}
