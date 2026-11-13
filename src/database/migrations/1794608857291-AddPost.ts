import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPost1794608857291 implements MigrationInterface {
    name = 'AddPost1794608857291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "post" (
                "id" SERIAL NOT NULL,
                "content" character varying NOT NULL,
                "published" boolean NOT NULL DEFAULT true,
                "authorId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"
        `);
        await queryRunner.query(`
            DROP TABLE "post"
        `);
    }

}
