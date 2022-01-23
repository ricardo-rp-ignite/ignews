import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import Head from 'next/head'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'
import { formatPostDate } from '../../utils/formatPostDate'

import styles from './Post.module.scss'

type PostQuery = { uid: string }
type PostProps = {
  post: {
    uid: string
    title: string
    content: string
    updatedAt: string
  }
}

export default function Post({
  post: { title, updatedAt, content },
}: PostProps) {
  return (
    <>
      <Head>
        <title>{title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{title}</h1>
          <time>{updatedAt}</time>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PostProps, PostQuery> =
  async ({ req, params: { uid } }) => {
    const session = await getSession({ req })

    if (!session.activeSubscription)
      return { redirect: { destination: '/', permanent: false } }

    const prismic = getPrismicClient(req)

    const response = await prismic.getByUID('post', String(uid), {})

    const post = {
      uid,
      title: RichText.asText(response.data.title),
      content: RichText.asHtml(response.data.content),
      updatedAt: formatPostDate(response.last_publication_date),
    }

    return { props: { post } }
  }
