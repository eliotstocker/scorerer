class APIError extends Error {
    code: number;
    internal: boolean;

    constructor(message : string, code = 400, internal = false) {
        super(message);
        this.code = code;
        this.internal = internal;
    }
}

export default APIError;