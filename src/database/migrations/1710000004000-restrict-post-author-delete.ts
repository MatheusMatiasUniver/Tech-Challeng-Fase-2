import { type MigrationInterface, QueryRunner } from 'typeorm'

// Com o CRUD de professores, um DELETE em users com ON DELETE CASCADE
// apagaria posts sem confirmacao, inclusive um post publicado entre a
// checagem e a exclusao. Com RESTRICT o proprio banco recusa excluir um
// autor com posts; apagar os posts passa a ser um passo explicito.
export class RestrictPostAuthorDelete1710000004000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_autor_id"',
    )
    await queryRunner.query(
      'ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_autor_id" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE RESTRICT',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_autor_id"',
    )
    await queryRunner.query(
      'ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_autor_id" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE',
    )
  }
}
