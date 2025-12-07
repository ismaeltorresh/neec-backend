/**
 * Simple paginate helper
 * @param {Array} items
 * @param {number} page 1-based
 * @param {number} pageSize
 * @returns {{data: Array, meta: {total:number,page:number,pageSize:number,totalPages:number}}}
 */
function paginate(items, page = 1, pageSize = 10) {
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

import { sequelize } from '../db/connection.js';
import boom from '@hapi/boom';

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
 * - orderBy: string
 */
async function sqlPaginate({
  table,
  recordStatus = true,
  page = 1,
  pageSize = 10,
  columns = '*',
  whereClause = 'recordStatus = :recordStatus',
  replacements = {},
  // filters: { colName: value }
  filters = {},
  // allowedFilters: array of column names allowed to be filtered
  allowedFilters = [],
  // search: { q: 'term', columns: ['col1','col2'] }
  search = undefined,
  // sorting: either provide raw orderBy string (backward compatible)
  // or provide sortBy + sortDir + allowedSorts to allow dynamic sorting
  orderBy = 'updatedAt DESC',
  sortBy = undefined,
  sortDir = 'DESC',
  allowedSorts = [],
}) {
  if (!table || typeof table !== 'string' || !/^[a-zA-Z0-9_]+$/.test(table)) {
    throw boom.badRequest('Invalid table name for sqlPaginate');
  }

  const pageNum = parseInt(page, 10) || 1;
  const size = parseInt(pageSize, 10) || 10;
  const offset = (pageNum - 1) * size;

  // Normalize recordStatus replacement: allow 'true'/'false', 1/0
  let rs = recordStatus;
  if (recordStatus === 'true' || recordStatus === true) rs = true;
  else if (recordStatus === 'false' || recordStatus === false) rs = false;
  else if (recordStatus === '1' || recordStatus === 1) rs = 1;
  else if (recordStatus === '0' || recordStatus === 0) rs = 0;

  const merged = Object.assign({}, replacements, { recordStatus: rs, limit: size, offset });
  // Build dynamic filter clauses from provided filters (only allowedFilters)
  let extraClauses = '';
  if (filters && typeof filters === 'object' && Array.isArray(allowedFilters) && allowedFilters.length) {
    Object.keys(filters).forEach((k) => {
      if (allowedFilters.includes(k) && /^[a-zA-Z0-9_]+$/.test(k)) {
        const placeholder = `f_${k}`;
        // Support wildcard searches if value contains %
        merged[placeholder] = filters[k];
        if (typeof filters[k] === 'string' && (filters[k].includes('%') || filters[k].includes('*'))) {
          // convert * to % for convenience
          const v = filters[k].replace(/\*/g, '%');
          merged[placeholder] = v;
          extraClauses += ` AND ${k} LIKE :${placeholder}`;
        } else {
          extraClauses += ` AND ${k} = :${placeholder}`;
        }
      }
    });
  }

  // Support simple full-text-ish search across multiple columns using LIKE
  if (search && search.q && Array.isArray(search.columns) && search.columns.length) {
    const qPlaceholder = 'q_search';
    merged[qPlaceholder] = `%${search.q}%`;
    const likes = search.columns.filter(c => /^[a-zA-Z0-9_]+$/.test(c)).map(c => `${c} LIKE :${qPlaceholder}`);
    if (likes.length) {
      extraClauses += ` AND (${likes.join(' OR ')})`;
    }
  }

  const finalWhere = `${whereClause}${extraClauses}`;

  // Determine ORDER BY clause: prefer sortBy/sortDir when provided and allowed,
  // otherwise fall back to raw orderBy string for backward compatibility.
  let orderClause = orderBy;
  if (sortBy) {
    // validate sortBy is allowed
    if (Array.isArray(allowedSorts) && allowedSorts.includes(sortBy) && /^[a-zA-Z0-9_]+$/.test(sortBy)) {
      const dir = ('' + sortDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderClause = `${sortBy} ${dir}`;
    } else {
      throw boom.badRequest('Invalid sortBy value or not allowed');
    }
  }

  const countQuery = `SELECT COUNT(*) as total FROM ${table} WHERE ${finalWhere}`;
  const dataQuery = `SELECT ${columns} FROM ${table} WHERE ${finalWhere} ORDER BY ${orderClause} LIMIT :limit OFFSET :offset`;

  // Use sequelize instance to run the queries
  const [[{ total }]] = await sequelize.query(countQuery, { replacements: merged, type: sequelize.QueryTypes.SELECT });
  const [rows] = await sequelize.query(dataQuery, { replacements: merged, type: sequelize.QueryTypes.SELECT });

  const totalNum = parseInt(total, 10) || 0;
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
