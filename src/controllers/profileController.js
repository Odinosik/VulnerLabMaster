const express = require('express');
const moment = require('moment');
const router = express.Router();
const cache = require('memory-cache');
const path = require('path');
const jwt = require('jsonwebtoken')
const axios = require('axios');
const app = express();

const secretKey = "secretKeyForJWT3";
const options = {
    expiresIn: '1h'
}

const cacheTimeout = 100 * 1000; // 100 seconds

//Obsluga dodatkowych formatow do cachowania
const fileDirectory = path.join(__dirname, 'styles')

const getAuthorize = (req, res) => {
               /* 
 #swagger.tags = ['Web Cache Deception']
 #swagger.summary = 'Authorize'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    const payload = {
        username: "bob",
        role: "user"
    };
    const token = jwt.sign(payload, secretKey, options);
    res.cookie('auth', token, { maxAge: 360000, path: '/' });
    return res.status(200).send("success");
};


const getProfile = (req, res) => {
           /* 
 #swagger.tags = ['Web Cache Deception']
 #swagger.summary = 'Send Note parameters'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    let cachedContent = cache.get(req.originalUrl);
    let cookie = req.headers['cookie'];

if (cachedContent){
        return res.status(200).send(canchedContent);
    }

    if (!cookie) {
        return res.status(401).send("Unauthorize");
    }
    return res.status(200).send(`<header>
        <h1>Moje Konto</h1>
    </header>

    <section>
        <div>
        Profile id: 123123
            <h2>Imię i Nazwisko</h2>
            <p>Twój opis lub krótka informacja o tobie.</p>

            <h2>Kontakt</h2>
            <p>Email: example@example.com</p>
            <p>Telefon: (123) 123123</p>

            <h2>Umiejętności</h2>
            <ul>
                <li>Umiejętność 1</li>
                <li>Umiejętność 2</li>
                <!-- Dodaj więcej umiejętności, jeśli to konieczne -->
            </ul>
        </div>
    </section>');
  `)
};

const getFile = async (req, res) => {
               /* 
 #swagger.tags = ['Web Cache Deception']
 #swagger.summary = 'Get File'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    try {
        const filename = req.params.filename;
        const filePath = path.join(fileDirectory, filename);
        const validExtensions = ['.css'];

        const fileExtension = path.extname(filename).toLowerCase();

        let cachedContent = await cache.get(req.originalUrl);

        if (!cachedContent) {
            const header = {'Cookie': req.headers['cookie']};
            const axiosOptions = {
                withCredentials: true,
                headers: header, 
            };

            const response = await axios.get('http://localhost:80/profile', axiosOptions);

            // Otrzymane dane
            const dataFromEndpoint1 = response.data;
            cache.put(req.originalUrl, dataFromEndpoint1, cacheTimeout);
            cachedContent = await cache.get(req.originalUrl);
        }
        res.status(200).send(cachedContent);
    }

    catch (error) {
        console.error('Error')
        return res.status(500).json({ status: "blad" });
    }
};
module.exports = {
    getAuthorize,
    getProfile,
    getFile
};