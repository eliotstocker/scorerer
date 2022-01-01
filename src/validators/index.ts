import User from './schema/user.json';
import Domain from './schema/domain.json';
import Entry from './schema/entry.json';
import Answer from './schema/answer.json';
import Theme from './schema/theme.json';
import validate from './validate';

export const user : (d: any) => void = validate.bind(null, User);
export const domain : (d: any) => void = validate.bind(null, Domain);
export const entry : (d: any) => void = validate.bind(null, Entry);
export const answer : (d: any) => void = validate.bind(null, Answer);
export const theme : (d: any) => void = validate.bind(null, Theme);