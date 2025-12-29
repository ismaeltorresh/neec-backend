/**
 * Helper para respuestas paginadas
 * Devuelve el contrato consistente { data, meta }
 * 
 * @module utils/response
 */

import type { PaginationResult } from '../types/index.js';

/**
 * Helper para respuestas paginadas
 * @param dataArray - Array de datos
 * @param page - Número de página
 * @param pageSize - Tamaño de página
 * @returns Resultado paginado
 */
export function paginated<T>(dataArray: T[] = [], page: number = 1, pageSize: number = 10): PaginationResult<T> {
  const arr = Array.isArray(dataArray) ? dataArray : [];
  const p = Number(page) || 1;
  const ps = Number(pageSize) || 10;
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / ps));
  const start = (p - 1) * ps;
  const data = arr.slice(start, start + ps);
  const meta = { total, page: p, pageSize: ps, totalPages };
  return { data, meta };
}
