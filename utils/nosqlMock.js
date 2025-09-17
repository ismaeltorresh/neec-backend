const { paginated } = require('./response');

function loadFake() {
  try {
    // Carga síncrona del JSON de pruebas
    // eslint-disable-next-line global-require
    const fake = require('../test/fakedata.json');
    return fake || {};
  } catch (err) {
    return {};
  }
}

function list(serviceName) {
  const fake = loadFake();
  const key = serviceName || '';
  // fakedata.json uses plural keys like 'people', 'products', 'address', 'template', 'users'
  return Array.isArray(fake[key]) ? fake[key] : [];
}

function findById(serviceName, id) {
  const arr = list(serviceName);
  return arr.find((item) => String(item.id) === String(id)) || null;
}

function _matchesFilter(itemValue, filterValue) {
  if (filterValue === undefined || filterValue === null) return true;
  // If filterValue is a string and contains * or %, treat as wildcard (contains)
  if (typeof filterValue === 'string') {
    const fv = filterValue;
    if (fv.includes('%') || fv.includes('*')) {
      const pattern = fv.replace(/\*/g, '%').toLowerCase();
      const normalized = String(itemValue || '').toLowerCase();
      const searchTerm = pattern.replace(/%/g, '');
      return normalized.includes(searchTerm);
    }
    // regular string: case-insensitive exact or contains? use case-insensitive exact match
    return String(itemValue || '').toLowerCase() === fv.toLowerCase();
  }
  // For non-strings do strict equality
  return itemValue === filterValue;
}

/**
 * Paginate with optional filters and search.
 * filters: { colName: value } — value can include % or * as wildcard
 * search: { q: 'term', columns: ['col1','col2'] }
 */
function paginateList(serviceName, page = 1, pageSize = 10, filters = {}, search = undefined) {
  let arr = list(serviceName);

  // Apply filters
  if (filters && typeof filters === 'object' && Object.keys(filters).length) {
    arr = arr.filter((item) => {
      return Object.keys(filters).every((k) => {
        // ignore unknown filter keys by treating as not matching
        const fv = filters[k];
        return _matchesFilter(item[k], fv);
      });
    });
  }

  // Apply simple search across multiple columns (case-insensitive, substring)
  if (search && search.q && Array.isArray(search.columns) && search.columns.length) {
    const q = String(search.q).toLowerCase();
    arr = arr.filter((item) => {
      return search.columns.some((col) => {
        if (!Object.prototype.hasOwnProperty.call(item, col)) return false;
        const val = String(item[col] || '').toLowerCase();
        return val.includes(q);
      });
    });
  }

  return paginated(arr, page, pageSize);
}

module.exports = { list, findById, paginateList };
