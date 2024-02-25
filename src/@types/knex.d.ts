// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

// aqui conseguimos que o knex consiga enteder quais tabelas e campos existe dentro do meu banco de dados

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
