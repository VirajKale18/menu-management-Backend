//a class defined for custom error handling which extends the inbuilt Error class.A common practice in web development when we need to provide more context and information about errors
class ApiError extends Error{
    constructor(statusCode,message="something went wrong",errors=[],stack=""){
        super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false;
    this.errors = errors

    if (stack) {
        this.stack = stack
    } else{
        Error.captureStackTrace(this, this.constructor)
    }

    }

}

module.exports = {ApiError}   