import bcrypt from 'bcryptjs'
import { type EntityManager } from 'typeorm'

import { AppDataSource } from '../data-source'
import { env } from '../../env'
import { DEMO_PASSWORD, demoPosts, demoUsers } from './demo-data'

// Deixa o banco exatamente no cenario da apresentacao, quantas vezes for
// preciso: aplica as migrations pendentes, apaga usuarios, posts e
// comentarios e grava o cenario de demo-data.ts.
//
// Uso: npm run demo:reset            (pergunta antes de apagar)
//      npm run demo:reset -- --yes   (sem pergunta, para scripts)
//
// O banco alvo e o das variaveis DATABASE_* (do .env ou do ambiente), entao o
// mesmo script serve para o Postgres local, o do Docker e o do Render.

const DAY_IN_MS = 24 * 60 * 60 * 1000
const HOUR_IN_MS = 60 * 60 * 1000

async function confirmReset(): Promise<boolean> {
  const args = process.argv.slice(2)

  if (args.includes('--yes') || args.includes('-y')) {
    return true
  }

  // Sem terminal (CI, docker exec sem -it) nao ha como perguntar. Melhor
  // parar do que apagar um banco sem ninguem ter confirmado.
  if (!process.stdin.isTTY) {
    console.error(
      'Nenhum terminal para confirmar. Rode de novo com --yes para apagar sem perguntar.',
    )

    return false
  }

  process.stdout.write('Digite "sim" para apagar e recriar os dados: ')

  return (await readLine()).trim().toLowerCase() === 'sim'
}

// Le uma linha do terminal. Feito a mao porque os tipos do node:readline nao
// batem com a versao do @types/node do projeto.
function readLine(): Promise<string> {
  return new Promise((resolve) => {
    process.stdin.setEncoding('utf8')
    process.stdin.once('data', (chunk: string) => {
      process.stdin.pause()
      resolve(chunk)
    })
  })
}

async function insertDemoData(manager: EntityManager): Promise<void> {
  // Uma unica instrucao para as tres tabelas: o PostgreSQL resolve a ordem das
  // chaves estrangeiras. A tabela migrations nao e tocada.
  await manager.query('TRUNCATE TABLE "comments", "posts", "users"')

  // Todas as contas tem a mesma senha, entao basta um hash. Com custo 12 cada
  // hash leva uns 250 ms; fazer um so por conta deixaria o reset bem mais lento.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const userIdsByEmail = new Map<string, string>()

  for (const user of demoUsers) {
    const [row] = (await manager.query(
      `INSERT INTO "users" ("nome", "email", "senha_hash", "papel")
       VALUES ($1, $2, $3, $4)
       RETURNING "id"`,
      [user.name, user.email, passwordHash, user.role],
    )) as Array<{ id: string }>

    userIdsByEmail.set(user.email, row.id)
  }

  const findUserId = (email: string): string => {
    const id = userIdsByEmail.get(email)

    if (id === undefined) {
      throw new Error(`Usuario ${email} nao esta em demoUsers`)
    }

    return id
  }

  // As datas sao gravadas de proposito (um dia entre cada post) para que a
  // ordem da lista no app seja sempre a mesma, do mais novo ao mais antigo.
  const now = Date.now()

  for (const [index, post] of demoPosts.entries()) {
    const createdAt = new Date(now - (demoPosts.length - index) * DAY_IN_MS)

    const [row] = (await manager.query(
      `INSERT INTO "posts" ("titulo", "conteudo", "autor_id", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $4)
       RETURNING "id"`,
      [post.title, post.content, findUserId(post.authorEmail), createdAt],
    )) as Array<{ id: string }>

    for (const [commentIndex, comment] of post.comments.entries()) {
      const commentedAt = new Date(
        createdAt.getTime() + (commentIndex + 1) * HOUR_IN_MS,
      )

      await manager.query(
        `INSERT INTO "comments" ("conteudo", "post_id", "autor_id", "created_at", "updated_at")
         VALUES ($1, $2, $3, $4, $4)`,
        [comment.content, row.id, findUserId(comment.authorEmail), commentedAt],
      )
    }
  }
}

async function resetDemo(): Promise<void> {
  console.log(
    `Banco alvo: ${env.DATABASE_NAME} em ${env.DATABASE_HOST}:${env.DATABASE_PORT}`,
  )
  console.log(
    'Todos os usuarios, posts e comentarios desse banco serao apagados e recriados.',
  )

  if (!(await confirmReset())) {
    console.log('Nada foi alterado.')
    process.exitCode = 1

    return
  }

  await AppDataSource.initialize()

  try {
    const migrations = await AppDataSource.runMigrations({ transaction: 'all' })

    console.log(`Migrations aplicadas agora: ${migrations.length}`)

    // Tudo numa transacao: se algo falhar no meio, o banco volta ao estado
    // anterior em vez de ficar sem usuarios.
    await AppDataSource.transaction(insertDemoData)

    const comments = demoPosts.reduce(
      (total, post) => total + post.comments.length,
      0,
    )
    const teachers = demoUsers.filter((user) => user.role === 'professor')

    console.log(
      `Pronto: ${teachers.length} professores, ${demoUsers.length - teachers.length} alunos, ${demoPosts.length} posts e ${comments} comentario(s).`,
    )
    console.log(`Senha de todas as contas: ${DEMO_PASSWORD}`)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

resetDemo().catch((error: unknown) => {
  console.error('Falha ao preparar os dados da apresentacao', error)
  process.exitCode = 1
})
