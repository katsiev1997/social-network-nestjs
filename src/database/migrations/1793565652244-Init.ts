import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1793565652244 implements MigrationInterface {
    name = 'Init1793565652244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
                RENAME COLUMN "age" TO "passwordHash"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "passwordHash"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "passwordHash" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "passwordHash"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "passwordHash" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
                RENAME COLUMN "passwordHash" TO "age"
        `);
    }

}
