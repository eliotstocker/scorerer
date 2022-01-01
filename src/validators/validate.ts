import Ajv, {Schema} from "ajv";
import betterAjvErrors from 'better-ajv-errors';
import ValidationError from "../errors/ValidationError";

const ajv = new Ajv();

export default function(schema: Schema, data: any) {
    const validate = ajv.compile(schema);

    const valid = validate(data);

    if(!valid && validate.errors) {
        const errors = betterAjvErrors(schema, data, validate.errors, {format: "js"});
        throw new ValidationError(errors);
    }
}
