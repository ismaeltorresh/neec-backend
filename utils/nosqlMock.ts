/**
 * [ES] Mock de base de datos NoSQL para pruebas
 * [EN] NoSQL database mock for testing
 * 
 * @module utils/nosqlMock
 */

import { paginated } from './response.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * [ES] Interfaz para elementos del mock
 * [EN] Interface for mock items
 */
interface MockItem {
  id: string | number;
  [key: string]: unknown;
}

/**
 * [ES] Estructura de datos fake
 * [EN] Fake data structure
 */
interface FakeData {
  [serviceName: string]: MockItem[];
}

/**
 * [ES] Opciones de búsqueda
 * [EN] Search options
 */
interface SearchOptions {
  q: string;
  columns: string[];
}

/**
 * [ES] Carga los datos de prueba desde fakedata.json
 * [EN] Load test data from fakedata.json
 */
function loadFake(): FakeData {
  try {
    const fakePath = join(__dirname, '..', 'test', 'fakedata.json');
    const content = readFileSync(fakePath, 'utf-8');
    return JSON.parse(content) as FakeData;
  } catch (err) {
    return {};
  }
}

/**
 * [ES] Lista todos los elementos de un servicio
 * [EN] List all items from a service
 * 
 * @param serviceName - [ES] Nombre del servicio (clave en fakedata.json) / [EN] Service name (key in fakedata.json)
 * @returns Array de elementos
 */
function list(serviceName: string): MockItem[] {
  const fake = loadFake();
  const key = serviceName || '';
  return Array.isArray(fake[key]) ? fake[key] : [];
}

/**
 * [ES] Busca un elemento por ID
 * [EN] Find an item by ID
 * 
 * @param serviceName - [ES] Nombre del servicio / [EN] Service name
 * @param id - [ES] ID del elemento / [EN] Item ID
 * @returns Elemento encontrado o null
 */
function findById(serviceName: string, id: string | number): MockItem | null {
  const arr = list(serviceName);
  return arr.find((item) => String(item.id) === String(id)) || null;
}

/**
 * [ES] Verifica si un valor coincide con un filtro (soporta wildcards % y *)
 * [EN] Check if a value matches a filter (supports wildcards % and *)
 * 
 * @param itemValue - [ES] Valor del item / [EN] Item value
 * @param filterValue - [ES] Valor del filtro / [EN] Filter value
 * @returns true si coincide
 */
function _matchesFilter(itemValue: unknown, filterValue: unknown): boolean {
  if (filterValue === undefined || filterValue === null) return true;
  
  // [ES] Si filterValue es string y contiene * o %, tratarlo como wildcard
  // [EN] If filterValue is a string and contains * or %, treat as wildcard
  if (typeof filterValue === 'string') {
    const fv = filterValue;
    if (fv.includes('%') || fv.includes('*')) {
      const pattern = fv.replace(/\*/g, '%').toLowerCase();
      const normalized = String(itemValue || '').toLowerCase();
      const searchTerm = pattern.replace(/%/g, '');
      return normalized.includes(searchTerm);
    }
    // [ES] Búsqueda exacta case-insensitive / [EN] Case-insensitive exact match
    return String(itemValue || '').toLowerCase() === fv.toLowerCase();
  }
  
  // [ES] Para non-strings, comparación estricta / [EN] For non-strings, strict equality
  return itemValue === filterValue;
}

/**
 * [ES] Pagina con filtros opcionales y búsqueda
 * [EN] Paginate with optional filters and search
 * 
 * @param serviceName - [ES] Nombre del servicio / [EN] Service name
 * @param page - [ES] Número de página / [EN] Page number
 * @param pageSize - [ES] Tamaño de página / [EN] Page size
 * @param filters - [ES] Filtros { colName: value } / [EN] Filters { colName: value }
 * @param search - [ES] Búsqueda { q: 'term', columns: ['col1','col2'] } / [EN] Search { q: 'term', columns: ['col1','col2'] }
 * @returns Resultado paginado
 */
function paginateList<T extends MockItem = MockItem>(
  serviceName: string,
  page: number = 1,
  pageSize: number = 10,
  filters: Record<string, unknown> = {},
  search?: SearchOptions
): ReturnType<typeof paginated> {
  let arr = list(serviceName);

  // [ES] Aplicar filtros / [EN] Apply filters
  if (filters && typeof filters === 'object' && Object.keys(filters).length) {
    arr = arr.filter((item) => {
      return Object.keys(filters).every((k) => {
        const fv = filters[k];
        return _matchesFilter(item[k], fv);
      });
    });
  }

  // [ES] Aplicar búsqueda simple en múltiples columnas (case-insensitive, substring)
  // [EN] Apply simple search across multiple columns (case-insensitive, substring)
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

export { list, findById, paginateList };
export type { MockItem, FakeData, SearchOptions };
