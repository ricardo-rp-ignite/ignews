import { GetStaticProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'
import { formatPostDate } from '../../utils/formatPostDate'

import styles from './Posts.module.scss'

type Post = {
  uid: string
  title: string
  summary: string
  updatedAt: string
}
type PostsProps = {
  posts: Post[]
}
export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(({ uid, updatedAt, title, summary }) => (
            <Link key={uid} passHref href={`/posts/${uid}`}>
              <a>
                <time>{updatedAt}</time>
                <strong>{title}</strong>
                <p>{summary}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<PostsProps> = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { fetch: ['title', 'content'], pageSize: 100 }
  )

  const posts = response.results.map(
    (post): Post => ({
      uid: post.uid,
      title: RichText.asText(post.data.title),
      summary: post.data.content.find(c => c.type === 'paragraph')?.text ?? '',
      updatedAt: formatPostDate(post.last_publication_date),
    })
  )

  return { props: { posts } }
}
