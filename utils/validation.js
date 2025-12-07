/**
 * Utilidades de validación y sanitización
 * 
 * @module utils/validation
 */

/**
 * Parsea un número entero de forma segura
 * @param {*} value - Valor a parsear
 * @param {number} defaultValue - Valor por defecto si falla
 * @param {number} min - Valor mínimo permitido
 * @param {number} max - Valor máximo permitido
 * @returns {number} Número parseado y validado
 */
export const parseIntSafe = (value, defaultValue = 0, min = null, max = null) => {
  const parsed = parseInt(value, 10);
  
  // Si no es un número válido, retornar default
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  // Validar rango mínimo
  if (min !== null && parsed < min) {
    return min;
  }
  
  // Validar rango máximo
  if (max !== null && parsed > max) {
    return max;
  }
  
  return parsed;
};

/**
 * Valida y sanitiza parámetros de paginación
 * @param {Object} params - Parámetros de entrada
 * @param {*} params.page - Número de página
 * @param {*} params.pageSize - Tamaño de página
 * @returns {Object} Parámetros validados
 */
export const validatePagination = ({ page, pageSize }) => {
  return {
    page: parseIntSafe(page, 1, 1, 10000),
    pageSize: parseIntSafe(pageSize, 10, 1, 100)
  };
};

/**
 * Sanitiza string para prevenir inyección
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .substring(0, 1000); // Limitar longitud
};

/**
 * Valida que un valor esté en una lista permitida
 * @param {*} value - Valor a validar
 * @param {Array} allowedValues - Valores permitidos
 * @param {*} defaultValue - Valor por defecto
 * @returns {*} Valor validado
 */
export const validateEnum = (value, allowedValues, defaultValue = null) => {
  return allowedValues.includes(value) ? value : defaultValue;
};

export default {
  parseIntSafe,
  validatePagination,
  sanitizeString,
  validateEnum
};
