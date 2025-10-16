const jwt = require('jsonwebtoken');
// Load the User model from the central models index
const { User } = require('../models'); 

const protectRoute = async (req, res, next) => {
    try {
        // Extract access token from HTTP-only cookies
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }
        
        try {
            // Verify JWT token using the secret used in the authController
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            
            const userId = decoded.userId;

            if (!userId) {
                return res.status(401).json({ message: "Invalid token payload" });
            }

            // Load user data using findByPk (Sequelize primary key lookup)
            const user = await User.findByPk(userId, {
                // Exclude the sensitive password hash field
                attributes: { exclude: ['Password_Hash'] } 
            });

            if (!user) {
                return res.status(401).json({ message: "User not found or deleted" });
            }

            // Attach user object to the request
            req.user = user;
            
            next();

        } catch (error) {
            // Handle specific JWT errors
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
            if (error.name === "JsonWebTokenError") {
                 return res.status(401).json({ message: "Unauthorized - Invalid access token signature" });
            }

            throw error;
        }
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(401).json({ message: "Unauthorized - Authentication failed" });
    }
};

module.exports = {
  protectRoute
};
