import boom from '@hapi/boom';
import logger from '../utils/logger.js';

function validatorHandler(schema, property){
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true // Remove unknown fields for security
    });
    
    if (error) {
      // Format validation errors
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      // Log validation failure (without sensitive data)
      logger.warn('Validation failed', { 
        property, 
        fields: details.map(d => d.field).join(', ')
      });
      
      next(boom.badRequest('Validation failed', { details }));
    } else {
      // Replace request data with sanitized/validated data
      req[property] = value;
      next();
    }
  }
}

export default validatorHandler;
