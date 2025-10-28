
/**
 * Middleware to check if a user has specific permissions.
 * 
 * @param {string[]} [requiredPermissions=[]] - Array of permission keys to check.
 * @returns {import('express').RequestHandler} Express middleware.
 * 
 * @example
 * // Use middleware to check permissions
 * const checkPermissions = require('./checkPermissions');
 * app.get('/admin', checkPermissions(['read_dashboard']), (req, res) => {
 *   if (!req.permissionsCheck['read_dashboard']) {
 *     return res.status(403).json({ error: "Forbidden" });
 *   }
 *   res.send("Welcome admin!");
 * });
 */


//<--Models-->
const Permission = require('../models/Permission');
const Rol = require('../models/Rol');

module.exports = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const requestedUser = req.requestedUser;
      if (!requestedUser) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const role = await Rol.findById(requestedUser.role);
      if (!role) {
        return res.status(500).json({ error: "Rol invalido" });
      }

      const permissions = await Promise.all(
        role.permissions.map(async (permId) => {
          const perm = await Permission.findById(permId);
          return perm ? perm.key : null;
        })
      );

      // Build result object
      const result = {};
      requiredPermissions.forEach((key) => {
        result[key] = permissions.includes(key);
      });

      req.permissionsCheck = result;

      next();
    } catch (error) {
      res.status(500).json({ error: "Error al validar permisos" });
    }
  };
};
