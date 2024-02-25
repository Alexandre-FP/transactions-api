/* eslint-disable prettier/prettier */
import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process"; // executa comando scripts dentro dos meus arquivos
import request from "supertest";
import { app } from "../src/app";

describe("Transactions routes", async () => {
  // describe -> descreve todos os teste das rotas transactions, podemos também criar uma ssub categoria dentro do describe
  beforeAll(async () => {
    // garanta que executa uma unica vez alguma coisa antes do test ser executado
    await app.ready();
  });

  afterAll(async () => {
    // depois que todos os nossos testes executam ela fecha a aplicação
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all"); // desfaz todas as magrations
    execSync("npm run knex migrate:latest"); // cria todas as migrations, e cada vez que os testes executa isso é repetido varias vezes voltando para a linha 20 e depois 21
  });

  // testes e2e tem que ter poucos mais eficientes
  it("o usuário criar uma nova transação", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "nova transação",
      amount: 5000,
      type: "credit",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("listar todas as tranações", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "nova transação",
      amount: 5000,
      type: "credit",
    });

    const cookies = response.get("Set-Cookie");

    console.log(cookies);

    const listTrasactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTrasactions.body.content).toEqual([
      expect.objectContaining({
        // espero um obejto contendo os seguintes informaçãos
        title: "nova transação",
        amount: 5000,
      }),
    ]);
  });

  it("listar todas as tranações especificas", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "nova transação",
      amount: 5000,
      type: "credit",
    });

    const cookies = response.get("Set-Cookie");

    console.log(cookies);

    const listTrasactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionsId = listTrasactions.body.content[0].id;

    const getTranactions = await request(app.server)
      .get(`/transactions/${transactionsId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTranactions.body.content).toEqual(
      expect.objectContaining({
        // espero um obejto contendo os seguintes informaçãos
        title: "nova transação",
        amount: 5000,
      })
    );
  });

  it("listar o resumo ", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "nova transação",
      amount: 5000,
      type: "credit",
    });

    const cookies = response.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "débito transação",
        amount: 300,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.content).toEqual({
      amount: 4700,
    });
  });
});
