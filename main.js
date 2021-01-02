import {promises as fs} from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import OpenApiValidator from 'express-openapi-validator';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import * as webpush from 'web-push';
if(process.env.NODE_ENV !== 'production'){
    dotenv.config();
}

const route = process.env.ROUTE_ROOT;
const port = process.env.PORT || 80;
const sslPort = process.env.sslPort || 443;

if(process.env.USE_SSL){
const sslOptions = await (async () => {
    return {
        key: await fs.readFile(process.env.SSL_PRIV_KEY_PATH).catch((e) => {console.error("An Error occured while reading SSL Key:\n" + e + '\n' + "Exiting..."); process.exit(-1)}),
        cert: await fs.readFile(process.env.SSL_CERT_PATH).catch((e) => {console.error("An Error occured while reading SSL Certificate:\n" + e + '\n' + "Exiting..."); process.exit(-1)}),
    }
})()}
const app = express();
const __dirname = path.dirname(import.meta.url);
const spec = path.join(__dirname, process.env.OPENAPI_SPEC_PATH);


const adapter = new FileSync('./db/db.json');
const db = lowdb(adapter);

db.defaults({subscriptions: []}).write();

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/spec', express.static(process.env.OPENAPI_SPEC_PATH));

app.use(OpenApiValidator.middleware({
    apiSpec: process.env.OPENAPI_SPEC_PATH,
    })
);

app.post('/test', (req, res, next) =>{
    res.status(200);
    res.send("200 OK");
})

app.post('/subscription', (req, res, next) => {
    db.get('subscriptions').push(
        {
            id : req.body.id,
            product : req.body.product,
            timestamp : req.body.timestamp,
            subscription : req.body.subscription,
        }).write();
    res.sendStatus(200);
})

app.get('/subscription', (req, res, next) => {
    let userSubscriptions = [];
    db.get('subscriptions').forEach(subscription => {
        //check wether the subscription object found in the request matches any subscription property of subscriptions in the database
        if(subscription.subscription === req.body.subscription){
            userSubscriptions.push(subscription);
        }
    })

    if (userSubscriptions.length < 0) {
        res.append()
    }
})

app.delete('/subscription/:id', (req, res, next) => {
    res.status(200);
    res.send("200 OK");
})

app.use((err, req, res, next) => {
    // format error
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});


http.createServer(app).listen(port);
if(process.env.USE_SSL) {
    https.createServer(sslOptions, app).listen(sslPort, () => {
        console.log("Server listening on port " + sslPort)
    });
}
