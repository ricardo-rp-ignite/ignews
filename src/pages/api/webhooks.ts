import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'

import Stripe from 'stripe'

import { stripe } from './_lib/services/stripe'
import { saveSubscription } from './_lib/manageSubscription'

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

// This allows us to consume the webhooks body as a stream
export const config = { api: { bodyParser: false } }

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  /* For now, the following event won't be handled as the only way to create a
   * subscription is through the website->Stripe Checkout flow.
   * If we decide to implement other subscription methods, the checkout event
   * handler must be updated not to duplicate the subscription on the database.
   */
  // 'customer.subscription.created',
])

async function webHooks(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const buf = await buffer(req)
  const signature = req.headers['stripe-signature']

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          // Type assertion is safe here because we have checked the event type
          const stripeCheckoutSession = event.data
            .object as Stripe.Checkout.Session

          await saveSubscription(
            stripeCheckoutSession.subscription.toString(),
            stripeCheckoutSession.customer.toString(),
            true
          )

          break
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Type assertion is safe here because we have checked the event type
          const stripeSubscription = event.data.object as Stripe.Subscription

          await saveSubscription(
            stripeSubscription.id,
            stripeSubscription.customer.toString()
          )

          break
        default:
          throw new Error(`Unhandled event type: ${event.type}`)
      }
    } catch (err) {
      // Here you would capture any errors and send them to your error
      // reporting service. (Ex: sentry, bugsnag, etc.).

      return res.json({
        error: 'Webhook handler failed',
      })
    }
  }

  res.status(200).json({ received: true })
}
export default webHooks
