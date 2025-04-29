// middleware to check if user is a superuser
const isSuperuser = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', data: 'Authentication required' });
    }

    if (req.user.role !== 'superuser') {
        return res.status(403).json({ status: 'error', data: 'Forbidden: Superuser access required' });
    }

    next();
};

module.exports = isSuperuser;