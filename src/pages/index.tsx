import Head from 'next/head'
import { GetServerSideProps } from 'next'

import { SubscribeButton } from '../components/SubscribeButton'

import styles from './Home.module.scss'
import { stripe } from '../services/stripe'

type HomeProps = {
  product: {
    priceId: string
    amount: number
  }
}
export default function Home({ product }: HomeProps) {
  const formattedAmount = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.amount)

  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome!</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the posts <br />
            <span>for {formattedAmount} a month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve('price_1JvB9TKXUpGoUJyr4ujj0ekG')

  const product = {
    priceId: price.id,
    amount: price.unit_amount / 100,
  }

  return { props: { product } }
}
