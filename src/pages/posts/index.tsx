import { GetStaticProps } from 'next'
import Head from 'next/head'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'

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
          {posts.map(post => (
            <a href="#" key={post.uid}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.summary}</p>
            </a>
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
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric' }
      ),
    })
  )

  return { props: { posts } }
}
