import jwt from 'jsonwebtoken';

import User from '../models/user.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');

        if(!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;

        next();
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: err.message });
    }
}

export default protectRoute;