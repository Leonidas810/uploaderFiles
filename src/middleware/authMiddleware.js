/**
 * Middleware to authenticate a user using a JWT stored in cookies.
 * It also populates the user's role, permissions, and position based on the token.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void} Calls next() if authentication succeeds, otherwise sends an error response.
 * 
 * @example
 * // Using the middleware in a route
 * const authenticateUser = require('./middlewares/authenticateUser');
 * 
 * app.get('/dashboard', authenticateUser, (req, res) => {
 *   // req.requestedUser contains the authenticated user
 *   res.json({ user: req.requestedUser });
 * });
 */

const jwt = require('jsonwebtoken');

//<--Models-->
const User = require('../models/User.js');

module.exports = async (req, res, next) => {
    const token = req.cookies.cnsProfile;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const activeResources = req.query.activeResources;

    const matchPermissions = { $or: [{ action: 'view' }] };
    if (activeResources) {
        const resourcesArray = activeResources.split(',').map(r => r.trim());
        matchPermissions.$or.push({ resource: { $in: resourcesArray } });
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({ id: verified.id })
            .populate({
                path: 'role',
                select: 'id name key level permissions',
                populate: {
                    path: 'permissions',
                    select: 'id key resource action',
                    match: matchPermissions
                }
            }).populate({
                path: 'position',
                select: `id name area level`,
            });
        if (!user || !user.status) {
            return res.status(401).json({ error: 'Usuario inválido' });
        }
        req.requestedUser = user
        next();
    } catch (error) {
        console.error(error)
        res.status(400).json({ error: 'Token no es válido' })
    }
}