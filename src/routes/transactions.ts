import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSession } from '../middleware/check-session-id'

// Request Body: onde esta os dados

// cookies <-> Formas de manter o contexto entre as requisições

export async function transactions(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    // nessa linha agora o preHandler ele é global, mais apenas para esse contexto esse plugin de transations
    // se eu quiser aplicar em todas as rotas pego esse blobo de código e colo la no meu app.ts antes de todas as rotas
    console.log(`[${request.method} ${request.url}]`)
  })

  app.get(
    '',
    {
      preHandler: [checkSession],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactionsGet = await knex('transactions')
        .select('*')
        .where('session_id', sessionId)

      return {
        content: transactionsGet,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSession],
    },
    async (request, reply) => {
      const idTransactionsParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = idTransactionsParams.parse(request.params)

      const { sessionId } = request.cookies

      const transactionsId = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!transactionsId) {
        return reply
          .status(401)
          .send(JSON.stringify({ mensage: 'Transactions not found' }))
      }

      return {
        content: transactionsId,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSession],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return {
        content: summary,
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionsBody = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionsBody.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply
      .status(201)
      .send(JSON.stringify({ mensage: 'transactions created successfully!' }))
  })
}
