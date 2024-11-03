import { afterAll, beforeAll, expect, test, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'

import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transaction')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

    expect(response.statusCode).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transaction')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')
    //console.log(cookies)
    const listTransactionsResponse = await request(app.server)
      .get('/transaction')
      .set('Cookie', cookies!)
      .expect(200)
    //console.log(listTransactionsResponse.body.transactions)
    expect(listTransactionsResponse.body.transactions).toEqual([
      /*{
        id: expect.any(String),
        title: 'New transaction',
        amount: '5000.00',
        created_at: expect.any(String),
        updated_at: null,
        session_id: expect.any(String)
      }*/
      expect.objectContaining({
        title: 'New transaction',
        amount: '5000.00'
      })
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transaction')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')
    //console.log(cookies)
    const listTransactionsResponse = await request(app.server)
      .get('/transaction')
      .set('Cookie', cookies!)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsResponse = await request(app.server)
    .get(`/transaction/${transactionId}`)
    .set('Cookie', cookies!)
    .expect(200)

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: '5000.00'
      })
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transaction')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const createTransactionResponse2 = await request(app.server)
    .post('/transaction')
    .set('Cookie', cookies!)
    .send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit'
    })

    const summaryResponse = await request(app.server)
      .get('/transaction/summary')
      .set('Cookie', cookies!)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: '3000.00'
    })
  })
})
