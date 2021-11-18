import Head from 'next/head'
import { GetStaticProps } from 'next'

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

          <SubscribeButton />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve(
    process.env.NEXT_PUBLIC_STRIPE_PRICEID
  )

  const product = {
    priceId: price.id,
    amount: price.unit_amount / 100,
  }

  return {
    props: { product },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}
