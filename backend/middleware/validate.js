const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      // Parse request against the provided Zod schema
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Zod might coerce types (like string to number), so we update req
      req.body = result.body || req.body;
      req.query = result.query || req.query;
      req.params = result.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            fields: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

module.exports = validate;
