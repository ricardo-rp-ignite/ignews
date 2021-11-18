import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'

import Stripe from 'stripe'

import { stripe } from '../../services/stripe'

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
    console.log('Evento recebido', event)
  }

  res.status(200).json({ received: true })
}
export default webHooks
