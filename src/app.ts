import fastify from 'fastify'
import { transactions } from './routes/transactions'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(transactions, {
  prefix: 'transactions', // faz com que todas as rotas se chama transactions
})
