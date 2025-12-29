/**
 * Entidad base con campos comunes para todas las entidades
 * @module entities/base.entity
 */

import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeORMBaseEntity,
} from 'typeorm';

/**
 * Clase base abstracta para todas las entidades con campos comunes.
 * Extiende de TypeORM BaseEntity para acceso a métodos estáticos del repositorio.
 */
export abstract class BaseEntity extends TypeORMBaseEntity {
  /**
   * ID único auto-incremental
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Indica si el registro está activo (soft delete)
   * @default true
   */
  @Column({ type: 'boolean', default: true, name: 'record_status' })
  recordStatus!: boolean;

  /**
   * Origen de los datos (sql, nosql, both, fake)
   * @default 'sql'
   */
  @Column({ type: 'varchar', length: 10, default: 'sql', name: 'data_source' })
  dataSource!: 'sql' | 'nosql' | 'both' | 'fake';

  /**
   * Fecha de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Fecha de última actualización
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
