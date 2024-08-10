const validateAuthToken = async (req, res, next) => {
    // Validation authentication token
    // e.g. var claims = await parseToken(req.headers.authorization);

    // Set any validated user information in req.user
    // e.g. req.validated_user_email = claims.email;
    
    // Pass control to next handler function
    next();
}

module.exports = { validateAuthToken }