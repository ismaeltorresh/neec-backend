/**
 * Repositorio para la entidad Example
 * @module repositories/example.repository
 */

import { BaseRepository } from './base.repository.js';
import { Example } from '../entities/example.entity.js';
import { AppDataSource } from '../db/connection.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Repositorio específico para la entidad Example.
 * Extiende BaseRepository con operaciones personalizadas.
 */
export class ExampleRepository extends BaseRepository<Example> {
  constructor() {
    super(AppDataSource.getRepository(Example));
  }

  /**
   * Busca un ejemplo por email
   * 
   * @param email - Email a buscar
   * @returns Promise con la entidad encontrada o null
   */
  async findByEmail(email: string): Promise<Example | null> {
    try {
      return await this.repository.findOne({
        where: {
          email,
          recordStatus: true,
        },
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding example by email', {
        email,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  /**
   * Busca ejemplos activos
   * 
   * @returns Promise con array de ejemplos activos
   */
  async findActive(): Promise<Example[]> {
    try {
      return await this.repository.find({
        where: {
          isActive: true,
          recordStatus: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding active examples', {
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }

  /**
   * Busca ejemplos por nombre (búsqueda parcial)
   * 
   * @param name - Nombre o parte del nombre a buscar
   * @returns Promise con array de ejemplos encontrados
   */
  async searchByName(name: string): Promise<Example[]> {
    try {
      return await this.repository
        .createQueryBuilder('example')
        .where('example.name LIKE :name', { name: `%${name}%` })
        .andWhere('example.recordStatus = :status', { status: true })
        .orderBy('example.name', 'ASC')
        .getMany();
    } catch (error) {
      const err = error as Error;
      logger.error('Error searching examples by name', {
        name,
        error: err.message,
      });
      throw boom.internal('Database query failed');
    }
  }
}
