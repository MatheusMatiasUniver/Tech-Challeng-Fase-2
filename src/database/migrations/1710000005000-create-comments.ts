import { type MigrationInterface, QueryRunner } from 'typeorm'

// Comentarios dos posts (item opcional da Fase 4). O indice (post_id,
// created_at) atende a unica consulta de leitura: os comentarios de um post
// em ordem cronologica. autor_id tem indice proprio porque o CASCADE ao
// excluir um usuario procura os comentarios dele.
export class CreateComments1710000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "conteudo" text NOT NULL,
        "post_id" uuid NOT NULL,
        "autor_id" uuid NOT NULL,
        "created_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_autor_id" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      'CREATE INDEX "IDX_comments_post_id_created_at" ON "comments" ("post_id", "created_at")',
    )
    await queryRunner.query(
      'CREATE INDEX "IDX_comments_autor_id" ON "comments" ("autor_id")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "comments"')
  }
}
