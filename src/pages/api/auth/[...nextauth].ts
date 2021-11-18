import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import { query as q } from 'faunadb'

import { fauna } from '../_lib/services/fauna'
import { userByEmail } from '../_lib/faunaQl'

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user',
    }),
  ],
  callbacks: {
    async signIn(user) {
      const { email } = user
      try {
        // Check if user exists before creating in fauna
        await fauna.query(
          q.If(
            q.Not(q.Exists(userByEmail(email))),
            q.Create(q.Collection('users'), { data: { email } }),
            q.Get(userByEmail(email))
          )
        )

        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
  },
})
