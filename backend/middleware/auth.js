const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Remove "Bearer " prefix if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(tokenString, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id; // Save user ID
        req.userRole = decoded.role || 'faculty'; // Save user role
        next();
    });
};

module.exports = verifyToken;
