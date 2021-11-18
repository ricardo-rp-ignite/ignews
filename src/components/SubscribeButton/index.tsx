import { signIn, useSession } from 'next-auth/client'

import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'

import styles from './SubscribeButton.module.scss'

export function SubscribeButton() {
  const [session] = useSession()

  async function handleSubscribe() {
    if (!session) return signIn('github')

    try {
      // Create checkout session
      const response = api.post<{ sessionId: string }>('/subscribe')
      const stripePromise = getStripeJs()

      const [{ data }, stripeJs] = await Promise.all([response, stripePromise])

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
