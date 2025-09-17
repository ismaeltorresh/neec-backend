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

module.exports = { paginate };
