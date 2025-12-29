/**
 * Entidad de ejemplo para demostrar el uso de TypeORM
 * 
 * ⚠️ IMPORTANTE: Mantener sincronizado con schemas/example.schema.ts
 * 
 * Checklist de sincronización:
 * ✓ name: varchar(255) ↔ z.string().max(255)
 * ✓ email: varchar(255) unique ↔ z.string().email().max(255)
 * ✓ description: text nullable ↔ z.string().optional().nullable()
 * ✓ isActive: boolean default true ↔ z.boolean().default(true)
 * 
 * @module entities/example.entity
 */

import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity.js';

/**
 * Entidad Example - Template para nuevas entidades
 * 
 * @example
 * ```typescript
 * const example = new Example();
 * example.name = 'Test Name';
 * example.email = 'test@example.com';
 * await example.save();
 * ```
 */
@Entity('examples')
@Index(['email'], { unique: true })
export class Example extends BaseEntity {
  /**
   * Nombre del ejemplo
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  /**
   * Email único del ejemplo
   */
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  /**
   * Descripción opcional
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  /**
   * Estado activo/inactivo
   */
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
