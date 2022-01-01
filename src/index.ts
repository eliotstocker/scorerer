import * as database from "./database";
import express from 'express';
import * as handlers from './handlers';
import cookieParser from 'cookie-parser';
import user from "./middleware/user";
import errors from "./middleware/errors";

const app : express.Express = express();
const port = process.env.SCORE_APP_PORT || 3000;

function init() : Promise<void> {
    return database.initialise()
        .then(() => new Promise(resolve => app.listen(port, () => {
            console.log(`starting server at 'http://localhost:${port}'`);
            resolve();
        })));
}

function shutdown(exitCode : number = 0) {
    console.log('shutting down....');

    //write current db state then shutdown
    database.flush()
        .then(() => process.exit(exitCode));
}

//register middleware
app.use(cookieParser('9n02pj32p98j.n89'));
app.use(user);

//register all handlers
Object.entries(handlers)
    .forEach(([route, handler]) => app.use(`/${route == 'app' ? '' : route}`, handler));

app.use(errors);

//run the server
init();

// catch any application closure
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGUSR1', shutdown);
process.on('SIGUSR2', shutdown);
// catch uncaught exceptions
// process.on('uncaughtException', shutdown);