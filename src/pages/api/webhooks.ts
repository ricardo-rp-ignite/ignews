import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'

import Stripe from 'stripe'

import { stripe } from '../../services/stripe'
import { saveSubscription } from './_lib/manageSubscription'

/* TODO: Bootcamp didn't go into streams. Must study further */
async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

// This allows us to consume the webhooks body as a stream
export const config = { api: { bodyParser: false } }

const relevantEvents = new Set(['checkout.session.completed'])

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
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          await saveSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString()
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
