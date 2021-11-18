import { query as q } from 'faunadb'

import { fauna } from './services/fauna'
import { stripe } from './services/stripe'
import { userByStripeCustomerId } from './faunaQl'

export async function saveSubscription(
  subscriptionId: string,
  customerId: string
) {
  // Get user ref from faunaDb by stripe customer id
  const userRef = await fauna.query(
    q.Select('ref', q.Get(userByStripeCustomerId(customerId)))
  )

  // Get subscription data from stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Save user subscription data to faunaDb
  await fauna.query(
    q.Create(q.Collection('subscriptions'), {
      data: {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
      },
    })
  )
}
