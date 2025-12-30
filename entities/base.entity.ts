/**
 * [ES] Entidad base con campos comunes para todas las entidades
 * [EN] Base entity with common fields for all entities
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
 * [ES] Clase base abstracta para todas las entidades con campos comunes
 * [EN] Abstract base class for all entities with common fields
 * [ES] Extiende de TypeORM BaseEntity para acceso a métodos estáticos del repositorio
 * [EN] Extends TypeORM BaseEntity for access to static repository methods
 */
export abstract class BaseEntity extends TypeORMBaseEntity {
  /**
   * [ES] ID único auto-incremental
   * [EN] Unique auto-incremental ID
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * [ES] Indica si el registro está activo (soft delete)
   * [EN] Indicates if record is active (soft delete)
   * @default true
   */
  @Column({ type: 'boolean', default: true, name: 'record_status' })
  recordStatus!: boolean;

  /**
   * [ES] Origen de los datos (sql, nosql, both, fake)
   * [EN] Data source origin (sql, nosql, both, fake)
   * @default 'sql'
   */
  @Column({ type: 'varchar', length: 10, default: 'sql', name: 'data_source' })
  dataSource!: 'sql' | 'nosql' | 'both' | 'fake';

  /**
   * [ES] Fecha de creación del registro
   * [EN] Record creation date
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * [ES] Fecha de última actualización
   * [EN] Last update date
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
