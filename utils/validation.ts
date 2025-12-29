/**
 * Utilidades de validación y sanitización
 * 
 * @module utils/validation
 */

import type { PaginationParams } from '../types/index.js';

/**
 * Parsea un número entero de forma segura
 * @param value - Valor a parsear
 * @param defaultValue - Valor por defecto si falla
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns Número parseado y validado
 */
export const parseIntSafe = (
  value: unknown,
  defaultValue: number = 0,
  min: number | null = null,
  max: number | null = null
): number => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  
  // Si no es un número válido, retornar default
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  let result = parsed;
  
  // Validar rango mínimo
  if (min !== null && result < min) {
    result = min;
  }
  
  // Validar rango máximo
  if (max !== null && result > max) {
    result = max;
  }
  
  return result;
};

/**
 * Valida y sanitiza parámetros de paginación
 * @param params - Parámetros de entrada
 * @returns Parámetros validados
 */
export const validatePagination = ({ page, pageSize }: PaginationParams): { page: number; pageSize: number } => {
  return {
    page: parseIntSafe(page, 1, 1, 10000),
    pageSize: parseIntSafe(pageSize, 10, 1, 100)
  };
};

/**
 * Sanitiza string para prevenir inyección
 * @param str - String a sanitizar
 * @returns String sanitizado
 */
export const sanitizeString = (str: unknown): string => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .substring(0, 1000); // Limitar longitud
};

/**
 * Valida que un valor esté en una lista permitida
 * @param value - Valor a validar
 * @param allowedValues - Valores permitidos
 * @param defaultValue - Valor por defecto
 * @returns Valor validado
 */
export const validateEnum = <T>(
  value: unknown,
  allowedValues: T[],
  defaultValue: T | null = null
): T | null => {
  return allowedValues.includes(value as T) ? (value as T) : defaultValue;
};

export default {
  parseIntSafe,
  validatePagination,
  sanitizeString,
  validateEnum
};
