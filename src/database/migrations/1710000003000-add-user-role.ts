import { type MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserRole1710000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // O DEFAULT temporario preenche os usuarios existentes (todos professores
    // do seed) numa unica instrucao. Em seguida ele e removido para que todo
    // cadastro novo informe o papel de forma explicita.
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "papel" varchar(20) NOT NULL DEFAULT 'professor'`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "CHK_users_papel" CHECK ("papel" IN ('professor', 'aluno'))`,
    )
    await queryRunner.query(
      'ALTER TABLE "users" ALTER COLUMN "papel" DROP DEFAULT',
    )
    await queryRunner.query(
      'CREATE INDEX "IDX_users_papel_nome" ON "users" ("papel", "nome")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_users_papel_nome"')
    await queryRunner.query(
      'ALTER TABLE "users" DROP CONSTRAINT "CHK_users_papel"',
    )
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "papel"')
  }
}
