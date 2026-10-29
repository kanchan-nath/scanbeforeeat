export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: 'Invalid route parameters',
        details: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    req.validatedParams = result.data;
    next();
  };
}
