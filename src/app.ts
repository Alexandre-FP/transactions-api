import fastify from 'fastify'
import { env } from './env'
import { transactions } from './routes/transactions'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)

app.register(transactions, {
  prefix: 'transactions', // faz com que todas as rotas se chama transactions
})

app.listen({ port: env.PORT }).then(() => {
  console.log('Server rodando')
})
