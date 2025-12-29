import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migración de ejemplo para crear tabla de ejemplos
 * 
 * Para generar automáticamente desde entidades:
 * npm run migration:generate -- migrations/CreateExampleTable
 * 
 * Para crear manualmente:
 * npm run migration:create -- migrations/CreateExampleTable
 */
export class CreateExampleTable1703851200000 implements MigrationInterface {
  name = 'CreateExampleTable1703851200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla examples
    await queryRunner.createTable(
      new Table({
        name: 'examples',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'record_status',
            type: 'boolean',
            default: true,
          },
          {
            name: 'data_source',
            type: 'varchar',
            length: '10',
            default: "'sql'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Crear índice único en email
    await queryRunner.createIndex(
      'examples',
      new TableIndex({
        name: 'IDX_EXAMPLES_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Crear índice en name para búsquedas
    await queryRunner.createIndex(
      'examples',
      new TableIndex({
        name: 'IDX_EXAMPLES_NAME',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('examples', 'IDX_EXAMPLES_NAME');
    await queryRunner.dropIndex('examples', 'IDX_EXAMPLES_EMAIL');

    // Eliminar tabla
    await queryRunner.dropTable('examples');
  }
}
