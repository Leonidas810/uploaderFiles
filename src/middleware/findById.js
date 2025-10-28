/**
 * Middleware to fetch a MongoDB document by a route parameter.
 * 
 * @param {import('mongoose').Model} Model - Mongoose model to query.
 * @param {string} [paramIdName='id'] - Name of the URL parameter containing the ID.
 * @param {string} [propName='doc'] - Name of the property to attach to req.
 * @returns {import('express').RequestHandler} Express middleware that adds the document to req.
 * 
 * @example
 * // Using the middleware in a route
 * const getModelMiddleware = require('./getModelMiddleware');
 * const User = require('./models/User');
 * 
 * app.get('/users/:id', getModelMiddleware(User, 'id', 'user'), (req, res) => {
 *   // req.user now contains the MongoDB document
 *   res.json(req.user);
 * });
 */

module.exports = (Model, paramIdName = 'id', propName = 'doc') => {
  return async (req, res, next) => {
    try {
      const id = req.params[paramIdName];
      const doc = await Model.findOne({id})
      if (!doc) {
        return res.status(404).json({ message: `${Model.modelName} not found` });
      }
      req[propName] = doc;
      next();
    } catch (err) {
      next(err);
    }
  };
};
