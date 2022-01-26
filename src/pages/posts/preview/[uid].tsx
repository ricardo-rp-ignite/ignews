import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import Link from 'next/link'
import { useSession } from 'next-auth/client'

import { getPrismicClient } from '../../../services/prismic'
import { formatPostDate } from '../../../utils/formatPostDate'

import styles from '../Post.module.scss'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

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
  post: { uid, title, updatedAt, content },
}: PostProps) {
  const [session] = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.activeSubscription) router.push(`/posts/${uid}`)
  }, [router, session, uid])

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className={styles.continueReading}>
            Want to read more?
            <Link href="/" passHref>
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths<PostQuery> = async () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<PostProps, PostQuery> = async ({
  params: { uid },
}) => {
  const prismic = getPrismicClient()

  const response = await prismic.getByUID('post', String(uid), {})

  const post = {
    uid,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: formatPostDate(response.last_publication_date),
  }

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  }
}
