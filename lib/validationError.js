// process validation errors, store to body
module.exports = handleValidationError = (errors, body) => {
    errors.forEach(error => {
        body[error.param+'Error'] = error.msg;
    });
}
