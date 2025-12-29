/**
 * Repositorio base con operaciones CRUD comunes
 * Implementa el patrón Repository con TypeORM
 * 
 * @module repositories/base.repository
 */

import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Repositorio base genérico con operaciones CRUD estándar.
 * Proporciona métodos comunes para todas las entidades.
 * 
 * @template T - Tipo de la entidad que extiende BaseEntity
 */
export abstract class BaseRepository<T extends BaseEntity> {
  /**
   * @param repository - Repositorio de TypeORM para la entidad
   */
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Encuentra todos los registros activos (recordStatus = true)
   * 
   * @param options - Opciones de búsqueda de TypeORM
   * @returns Promise con array de entidades
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find({
        ...options,
        where: {
          ...options?.where,
          recordStatus: true,
        } as FindOptionsWhere<T>,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding all records', {
        entity: this.repository.metadata.tableName,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  /**
   * Encuentra un registro por ID
   * 
   * @param id - ID del registro
   * @returns Promise con la entidad encontrada o null
   */
  async findById(id: number): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: {
          id,
          recordStatus: true,
        } as FindOptionsWhere<T>,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding record by ID', {
        entity: this.repository.metadata.tableName,
        id,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  /**
   * Encuentra un registro por condiciones
   * 
   * @param where - Condiciones de búsqueda
   * @returns Promise con la entidad encontrada o null
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: {
          ...where,
          recordStatus: true,
        } as FindOptionsWhere<T>,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding one record', {
        entity: this.repository.metadata.tableName,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  /**
   * Crea un nuevo registro
   * 
   * @param data - Datos de la entidad a crear
   * @returns Promise con la entidad creada
   */
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      const err = error as Error;
      logger.error('Error creating record', {
        entity: this.repository.metadata.tableName,
        error: err.message,
      });
      throw boom.internal('Database insert failed');
    }
  }

  /**
   * Actualiza un registro existente
   * 
   * @param id - ID del registro a actualizar
   * @param data - Datos parciales a actualizar
   * @returns Promise con la entidad actualizada
   */
  async update(id: number, data: DeepPartial<T>): Promise<T> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw boom.notFound(`Record with ID ${id} not found`);
      }

      this.repository.merge(entity, data);
      return await this.repository.save(entity);
    } catch (error) {
      const err = error as Error;
      logger.error('Error updating record', {
        entity: this.repository.metadata.tableName,
        id,
        error: err.message,
      });
      if (boom.isBoom(error)) throw error;
      throw boom.internal('Database update failed');
    }
  }

  /**
   * Elimina lógicamente un registro (soft delete)
   * Cambia recordStatus a false en lugar de eliminar físicamente
   * 
   * @param id - ID del registro a eliminar
   * @returns Promise<void>
   */
  async delete(id: number): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw boom.notFound(`Record with ID ${id} not found`);
      }

      entity.recordStatus = false;
      await this.repository.save(entity);
    } catch (error) {
      const err = error as Error;
      logger.error('Error deleting record', {
        entity: this.repository.metadata.tableName,
        id,
        error: err.message,
      });
      if (boom.isBoom(error)) throw error;
      throw boom.internal('Database delete failed');
    }
  }

  /**
   * Elimina físicamente un registro de la base de datos
   * USAR CON PRECAUCIÓN - No se puede deshacer
   * 
   * @param id - ID del registro a eliminar permanentemente
   * @returns Promise<void>
   */
  async hardDelete(id: number): Promise<void> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        throw boom.notFound(`Record with ID ${id} not found`);
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Error hard deleting record', {
        entity: this.repository.metadata.tableName,
        id,
        error: err.message,
      });
      if (boom.isBoom(error)) throw error;
      throw boom.internal('Database hard delete failed');
    }
  }

  /**
   * Cuenta el total de registros activos
   * 
   * @param where - Condiciones opcionales de búsqueda
   * @returns Promise con el conteo
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    try {
      return await this.repository.count({
        where: {
          ...where,
          recordStatus: true,
        } as FindOptionsWhere<T>,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error counting records', {
        entity: this.repository.metadata.tableName,
        error: err.message,
      });
      throw boom.internal('Database count failed');
    }
  }
}
