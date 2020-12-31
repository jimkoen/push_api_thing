import {promises as fs} from 'fs';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import express from 'express';
import * as webpush from 'web-push';
if(process.env.NODE_ENV !== 'production'){
    dotenv.config();
}
const route = process.env.ROUTE_ROOT;
const port = process.env.PORT || 80;
const sslPort = process.env.sslPort || 443;
const sslOptions = await (async () => {
    return {
        key: fs.readFile(process.env.SSL_PRIV_KEY_PATH).catch((e) => {console.error("An Error occured while reading SSL Key:\n" + e + '\n' + "Exiting..."); process.exit(-1)}),
        cert: fs.readFile(process.env.SSL_CERT_PATH).catch((e) => {console.error("An Error occured while reading SSL Certificate:\n" + e + '\n' + "Exiting..."); process.exit(-1)}),
    }
})()
const app = express();



http.createServer(app).listen(port);
https.createServer(sslOptions, app).listen(sslPort, () => {
    console.log("Server listening on port " + sslPort)
    console.log("Secret URL: " + botUrl);
});
