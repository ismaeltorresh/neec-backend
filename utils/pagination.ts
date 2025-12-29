/**
 * Utilidades de paginación
 * 
 * @module utils/pagination
 */

import type { PaginationResult, SqlPaginateOptions } from '../types/index.js';
import { sequelize } from '../db/connection.js';
import boom from '@hapi/boom';

/**
 * Simple paginate helper
 * @param items - Array de items
 * @param page - Número de página (1-based)
 * @param pageSize - Tamaño de página
 * @returns Resultado paginado
 */
function paginate<T>(items: T[], page: number = 1, pageSize: number = 10): PaginationResult<T> {
  const arr = Array.isArray(items) ? items : [];
  const p = Number(page) || 1;
  const ps = Number(pageSize) || 10;
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / ps));
  const start = (p - 1) * ps;
  const data = arr.slice(start, start + ps);
  const meta = { total, page: p, pageSize: ps, totalPages };
  return { data, meta };
}

/**
 * Paginate a SQL table using COUNT + SELECT with LIMIT/OFFSET.
 *
 * Options:
 * - table: string (required) - table name (alphanumeric and underscore only)
 * - recordStatus: boolean|number|string - value used for :recordStatus replacement
 * - page: number
 * - pageSize: number
 * - columns: string (columns to select)
 * - whereClause: string (WHERE clause template, must reference :recordStatus if used)
 * - replacements: object (additional replacements for the query)
 * - filters: { colName: value }
 * - allowedFilters: array of column names allowed to be filtered
 * - search: { q: 'term', columns: ['col1','col2'] }
 * - orderBy: string
 * - sortColumn: string
 * - sortOrder: 'ASC' | 'DESC'
 * - allowedSortColumns: string[]
 */
async function sqlPaginate<T = unknown>(options: SqlPaginateOptions): Promise<PaginationResult<T>> {
  const {
    table,
    recordStatus = true,
    page = 1,
    pageSize = 10,
    columns = '*',
    whereClause = 'recordStatus = :recordStatus',
    replacements = {},
    filters = {},
    allowedFilters = [],
    search = undefined,
    orderBy = 'updatedAt DESC',
    sortColumn = undefined,
    sortOrder = 'DESC',
    allowedSortColumns = [],
  } = options;

  if (!table || typeof table !== 'string' || !/^[a-zA-Z0-9_]+$/.test(table)) {
    throw boom.badRequest('Invalid table name for sqlPaginate');
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const size = parseInt(String(pageSize), 10) || 10;
  const offset = (pageNum - 1) * size;

  // Normalize recordStatus replacement: allow 'true'/'false', 1/0
  let rs: boolean | number | string = recordStatus;
  if (recordStatus === 'true' || recordStatus === true) rs = true;
  else if (recordStatus === 'false' || recordStatus === false) rs = false;
  else if (recordStatus === '1' || recordStatus === 1) rs = 1;
  else if (recordStatus === '0' || recordStatus === 0) rs = 0;

  const merged: Record<string, unknown> = { ...replacements, recordStatus: rs, limit: size, offset };

  // Build dynamic filter clauses from provided filters (only allowedFilters)
  let extraClauses = '';
  if (filters && typeof filters === 'object' && Array.isArray(allowedFilters) && allowedFilters.length) {
    Object.keys(filters).forEach((k) => {
      // Strict validation: column must be in allowedFilters AND match regex
      if (!allowedFilters.includes(k)) {
        throw boom.badRequest(`Filter column '${k}' is not allowed`);
      }
      if (!/^[a-zA-Z0-9_]+$/.test(k)) {
        throw boom.badRequest(`Invalid filter column name '${k}'`);
      }
      
      const placeholder = `f_${k}`;
      // Support wildcard searches if value contains %
      merged[placeholder] = filters[k];
      if (typeof filters[k] === 'string' && (String(filters[k]).includes('%') || String(filters[k]).includes('*'))) {
        // convert * to % for convenience
        const v = String(filters[k]).replace(/\*/g, '%');
        merged[placeholder] = v;
        extraClauses += ` AND ${k} LIKE :${placeholder}`;
      } else {
        extraClauses += ` AND ${k} = :${placeholder}`;
      }
    });
  }

  // Support simple full-text-ish search across multiple columns using LIKE
  if (search && search.q && Array.isArray(search.columns) && search.columns.length) {
    const qPlaceholder = 'q_search';
    merged[qPlaceholder] = `%${search.q}%`;
    // Strict validation: all search columns must match regex
    const validColumns = search.columns.filter(c => /^[a-zA-Z0-9_]+$/.test(c));
    if (validColumns.length === 0) {
      throw boom.badRequest('No valid search columns provided');
    }
    const likes = validColumns.map(c => `${c} LIKE :${qPlaceholder}`);
    extraClauses += ` AND (${likes.join(' OR ')})`;
  }

  const finalWhere = `${whereClause}${extraClauses}`;

  // Determine ORDER BY clause: prefer sortColumn/sortOrder when provided and allowed,
  // otherwise fall back to raw orderBy string for backward compatibility.
  let orderClause = orderBy;
  if (sortColumn) {
    // validate sortColumn is allowed
    if (Array.isArray(allowedSortColumns) && allowedSortColumns.includes(sortColumn) && /^[a-zA-Z0-9_]+$/.test(sortColumn)) {
      const dir = (String(sortOrder)).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderClause = `${sortColumn} ${dir}`;
    } else {
      throw boom.badRequest('Invalid sortColumn value or not allowed');
    }
  }

  const countQuery = `SELECT COUNT(*) as total FROM ${table} WHERE ${finalWhere}`;
  const dataQuery = `SELECT ${columns} FROM ${table} WHERE ${finalWhere} ORDER BY ${orderClause} LIMIT :limit OFFSET :offset`;

  // Use sequelize instance to run the queries
  const [[countResult]] = await sequelize.query(countQuery, { 
    replacements: merged
  }) as [[{ total: number }], unknown];
  
  const [rows] = await sequelize.query(dataQuery, { 
    replacements: merged
  }) as [T[], unknown];

  const totalNum = parseInt(String(countResult.total), 10) || 0;
  const totalPages = Math.max(1, Math.ceil(totalNum / size));

  return {
    data: rows,
    meta: {
      total: totalNum,
      page: pageNum,
      pageSize: size,
      totalPages,
    },
  };
}

export { paginate, sqlPaginate };
