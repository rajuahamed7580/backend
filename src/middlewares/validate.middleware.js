import AppError from '../utils/AppError.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body && req.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query && req.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params && req.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError(400, formattedErrors[0]?.message || 'Validation failed', formattedErrors));
      }
      next(error);
    }
  };
};

export default validateRequest;
