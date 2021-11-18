import { signIn, useSession } from 'next-auth/client'

import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'

import styles from './SubscribeButton.module.scss'

export function SubscribeButton() {
  const [session] = useSession()

  async function handleSubscribe() {
    if (!session) return signIn('github')

    try {
      const [{ data }, stripeJs] = await Promise.all([
        // Create checkout session and get sessionId
        api.post<{ sessionId: string }>('/subscribe'),
        // Load stripeJs
        getStripeJs(),
      ])

      // Open checkout
      stripeJs.redirectToCheckout(data)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}
