import Stripe from 'stripe'

// DO NOT IMPORT THIS IN CLIENT-SIDE CODE.
// THIS MUST ONLY BE USED IN API ROUTES OR SERVER-RENDERING PAGES

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    name: 'Ignews',
    version: '0.1.0',
  },
})
