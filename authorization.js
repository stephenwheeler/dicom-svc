const validateAuthToken = async (req, res, next) => {
    // Validation authentication token
    // e.g. var claims = await parseToken(req.headers.authorization);

    // Set any validated user information in req.user
    // e.g. req.validated_user_email = claims.email;
    req.validated_user_email = 'test';
    req.validated_user_scopes = ['admin', 'user'];

    // Pass control to next handler function
    next();
}

const validateDataAccess = async (req, res, next) => {

    // Validation data access
    // e.g. if (req.validated_user_scopes.includes('admin')) {
    //     return next();
    // }
    if (req.params.dicomId) {
        // validate_data_access(req.params.dicomId, req.validated_user_email, req.validated_user_scopes);
    }

    // Pass control to next handler function
    next();
}
module.exports = { validateAuthToken, validateDataAccess }