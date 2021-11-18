import { NextApiRequest, NextApiResponse } from 'next'

import { query as q } from 'faunadb'
import { getSession } from 'next-auth/client'

import { fauna } from './_lib/services/fauna'
import { stripe } from './_lib/services/stripe'
import { userByEmail } from './_lib/faunaQl'

type User = {
  ref: { id: string }
  data: { stripe_customer_id: string }
}

const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Get user session from cookie
  const session = await getSession({ req })

  // Get user from faunaDb
  const user = await fauna.query<User>(q.Get(userByEmail(session.user.email)))
  let stripeCustomerId = user.data.stripe_customer_id

  // Create stripe customer if it doesn't exist
  if (!stripeCustomerId) {
    // Create customer in stripe
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    })

    // Add stripe customer id to faunaDb user
    await fauna.query(
      q.Update(q.Ref(q.Collection('users'), user.ref.id), {
        data: { stripe_customer_id: stripeCustomer.id },
      })
    )

    stripeCustomerId = stripeCustomer.id
  }

  // Create stripe checkout session
  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
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
