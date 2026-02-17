const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Auth failed: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Token decoded successfully:', { id: decoded.id, type: decoded.type });

    // Check if user/technician exists
    if (decoded.type === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        console.log('Auth failed: User not found in database, id:', decoded.id);
        return res.status(401).json({ error: 'User not found' });
      }
      if (user.status !== 'ACTIVE') {
        console.log('Auth failed: User inactive, id:', decoded.id, 'status:', user.status);
        return res.status(401).json({ error: 'User inactive' });
      }
      req.user = user;
      console.log('Auth successful: User authenticated', { id: user.id, email: user.email });
    } else if (decoded.type === 'technician') {
      const technician = await prisma.technician.findUnique({
        where: { id: decoded.id },
      });
      if (!technician) {
        console.log('Auth failed: Technician not found, id:', decoded.id);
        return res.status(401).json({ error: 'Technician not found' });
      }
      req.technician = technician;
      console.log('Auth successful: Technician authenticated', { id: technician.id });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
};

const requireTechnician = (req, res, next) => {
  if (!req.technician) {
    return res.status(403).json({ error: 'Technician access required' });
  }
  next();
};

module.exports = {
  authenticate,
  requireUser,
  requireTechnician,
};
