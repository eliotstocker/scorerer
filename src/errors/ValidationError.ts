import {IOutputError} from "better-ajv-errors";

class ValidationError extends Error {
    private static header = 'Input validation failed with the following errors:';
    constructor(errors: IOutputError[]) {
        const displayErrors = errors.map((e, i) => `    ${i + 1}: ${e.error}` + (e.suggestion ? ` | ${e.suggestion}` : ''));

        super(`${ValidationError.header}\n${displayErrors.join('\n')}`);
    }
}

export default ValidationError;