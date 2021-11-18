import { query as q } from 'faunadb'
import Stripe from 'stripe'

import { fauna } from './services/fauna'
import { stripe } from './services/stripe'
import { userByStripeCustomerId } from './faunaQl'

// Describes the data that is stored in the subscription collection
type FaunaSubscriptionData = {
  id: string
  userId: object
  status: Stripe.Subscription.Status
  price_id: string
}

export async function saveSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  isNewSubscription = false
) {
  // Get user ref from faunaDb by stripe customer id
  const userRef = await fauna.query(
    q.Select('ref', q.Get(userByStripeCustomerId(stripeCustomerId)))
  )

  // Get subscription data from stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  )

  const subscriptionData: FaunaSubscriptionData = {
    id: stripeSubscription.id,
    userId: userRef,
    status: stripeSubscription.status,
    price_id: stripeSubscription.items.data[0].price.id,
  }

  if (isNewSubscription) {
    await createSubscription(subscriptionData)
  } else {
    await replaceSubscriptionById(subscriptionData, stripeSubscriptionId)
  }
}

async function createSubscription(subscriptionData: FaunaSubscriptionData) {
  return await fauna.query(
    q.Create(q.Collection('subscriptions'), { data: subscriptionData })
  )
}

async function replaceSubscriptionById(
  subscriptionData: FaunaSubscriptionData,
  subscriptionId: string
) {
  return await fauna.query(
    q.Replace(
      q.Select(
        'ref',
        q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))
      ),
      { data: subscriptionData }
    )
  )
}
