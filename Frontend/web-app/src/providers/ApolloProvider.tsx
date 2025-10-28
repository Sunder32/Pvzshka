'use client'

import { ApolloClient, InMemoryCache, ApolloProvider as Provider, HttpLink } from '@apollo/client'
import { ReactNode } from 'react'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'

const client = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
  }),
  cache: new InMemoryCache(),
})

export default function ApolloProvider({ children }: { children: ReactNode }) {
  return <Provider client={client}>{children}</Provider>
}
