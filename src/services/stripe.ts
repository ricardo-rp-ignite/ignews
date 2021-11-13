import Stripe from 'stripe'

// DO NOT IMPORT THIS IN CLIENT-SIDE ROUTES.

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    name: 'Ignews',
    version: '0.1.0',
  },
})
