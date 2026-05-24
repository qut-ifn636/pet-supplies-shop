// backend/responseFactory.js
// Factory Pattern - Creates consistent API responses

class ResponseFactory {

    // Success Responses
    static success(data = null, message = 'Operation completed successfully', statusCode = 200) {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            statusCode
        };
    }

    static created(data, message = 'Resource created successfully') {
        return this.success(data, message, 201);
    }

    static ok(data, message = 'Request successful') {
        return this.success(data, message, 200);
    }

    // Error Responses
    static error(message = 'Internal server error', statusCode = 500, errors = null) {
        return {
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
            statusCode
        };
    }

    static badRequest(message = 'Bad request', errors = null) {
        return this.error(message, 400, errors);
    }

    static unauthorized(message = 'Unauthorized access') {
        return this.error(message, 401);
    }

    static notFound(message = 'Resource not found') {
        return this.error(message, 404);
    }

    static conflict(message = 'Resource already exists') {
        return this.error(message, 409);
    }
}

module.exports = ResponseFactory;