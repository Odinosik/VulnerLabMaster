const express = require('express');
const moment = require('moment');
const router = express.Router();
const cache = require('memory-cache');
const path = require('path');
const jwt = require('jsonwebtoken')
const app = express();

const secretKey = "secretKeyForJWT3";
const options = {
    expiresIn: '1h'
  }

const cacheTimeout = 100 * 1000; // 100 seconds

//Obsluga dodatkowych formatow do cachowania
const fileDirectory = path.join(__dirname, 'styles')

router.use((req, res, next) => {
    // Sprawdź, czy ciasteczko już istnieje
    
    const payload = {
        username: "bob",
        role: "user"
    };
    const token = jwt.sign(payload, secretKey, options);

    res.cookie('auth',token, {maxAge: 360000, path: '/'});
    // Przejdź do obsługi endpointa
    next();
  });

  router.get('/styles', (req, res) => {
    return res.status(200).send("<h1>Styles Page</h1>");
  });

router.get('/styles/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(fileDirectory, filename);
        const validExtensions = ['.css'];

        const fileExtension = path.extname(filename).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            return res.status(400).send('Invalid file type');
        }
        //sprawdzenie cachowania

        const cachedContent = cache.get(req.originalUrl);

        if (cachedContent) {
            return res.send(cachedContent);
        } else {

            const userDataCookie = req.headers['cookie'];
            const cacheInfo = `
            <div id="cache_info">
              <p> The page was cached at: [${moment().format()}] </p>
              <p> The user was redirected from: [${req.headers.referer}] </p>
              <p> User data from cookie: [${userDataCookie}] </p>
            </div>
            `;
            // Store content in cache
            cache.put(req.originalUrl, cacheInfo, cacheTimeout);
        }
        // Wysłanie pliku do klienta
        res.sendFile(filePath, { root: fileDirectory }, (err) => {
            if (err) {
                console.error(err);
                return res.status(404).send('File not found');
            }
        });
    }
    catch (error) {
        console.error('Error')
        return res.status(500).json({ status: "blad" });
    }
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


//Wyswietlanie chached strony jesli url zostal cached
/*
router.use((req, res, next) => {
    const cachedContent = cache.get(req.originalUrl);

    if (cachedContent) {
        res.send(cachedContent);
    } else {
        next();
    }
});
*/
/*
router.get('/', (req, res) => {
    const cacheInfo = `
    <div id="cache_info">
      <p> The page was cached at: [${moment().format()}] </p>
      <p> The user was redirected from: [${req.headers.referer}] </p>
      <p> User data from cookie: [${userDataCookie}] </p>
    </div>
    `;

    // Store content in cache
    cache.put(req.originalUrl, cacheInfo, cacheTimeout);
    const cachedContent = Object.keys(cache.keys()).map((key) => {
        return {
            [key]: cache.get(key),
        };
    });

    res.send(cacheInfo);
});
*/
// Endpoint to display cached content
router.get('/cachedContent', (req, res) => {
    const cachedContent = Object.keys(cache.keys()).map((key) => {
        return {
            [key]: cache.get(key),
        };
    });

    res.json({ cachedContent });
});

/*
//lapanie bledow
router.use((req, res, next) => {
    const cacheInfo = `
    <div id="cache_info">
      <p> The page was cached at: [${moment().format()}] </p>
      <p> The user was redirected from: [${req.headers.referer}] </p>
    </div>
    `;
    cache.put(req.originalUrl, cacheInfo, cacheTimeout);

    // Store content in cache
    cache.put(req.originalUrl, cacheInfo, cacheTimeout);
    const cachedContent = cache.keys().map((key) => {
        return {
            [key]: cache.get(key),
        };
    });
    res.json({ cachedContent });
    //res.status(404).send(cacheInfo +'Page not found - Custom error');
});
*/
module.exports = router;