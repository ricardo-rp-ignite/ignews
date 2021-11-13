import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

import { stripe } from '../../services/stripe'

const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Get user session from cookie
  const session = await getSession({ req })

  // Create customer in stripe
  const stripeCustomer = await stripe.customers.create({
    email: session.user.email,
  })

  // Create stripe checkout session
  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomer.id,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      { price: process.env.NEXT_PUBLIC_STRIPE_PRICEID, quantity: 1 },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  })

  return res.status(200).json({ sessionId: stripeCheckoutSession.id })
}

export default subscribe
