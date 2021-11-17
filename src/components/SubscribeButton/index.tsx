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
      const response = await api.post('/subscribe')
      const { sessionId } = response.data

      const stripeJs = await getStripeJs()
      stripeJs.redirectToCheckout({ sessionId })
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
