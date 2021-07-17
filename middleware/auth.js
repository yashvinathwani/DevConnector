const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Get token from the header of protected route
    const token = req.header('x-auth-token');

    // Check if the token is there or not
    if(!token){
        return res.status(401).json({ msg : 'No token, authorization denied' });
    }

    // If there is a token
    try {
        // Decode the token with the secret
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // If correct, assign the user that made the equest to the user that has the token
        req.user = decoded.user;
        next();
    }
    catch(err) {
        // If not correct, then send error message
        return res.status(401).json({ msg : 'Token is not valid'});
    }
}