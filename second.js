const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const jwt = require('jsonwebtoken')

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.1";
const MONGODB_DB_NAME = "local";
const secretKey = "secretKeyForJWT";
const options = {
  expiresIn: '1h'
}
function removeCircularReferences(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  });

}
function parseJSONorReturnOriginal(inputString) {
  try {
      return JSON.parse(inputString);
  } catch (error) {
      return inputString;
  }
}

// NOSQL - Podatnosc w wyszukiwarce
router.post('/second', async (req, res) => {

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .catch(err => { console.log(err); });
    if (!client) {
      return res.json({ status: "Error" });
    }
    const db = client.db(MONGODB_DB_NAME);
    const customers = db.collection("customers")


    let name = req.body.name
    let myobj = { name: name };
    let data = await customers.findOne(myobj);
    const johnDoeData = await customers.findOne({ name: 'John Doe' });

    console.log('Data for John Doe:', johnDoeData);
    const { name2, address } = johnDoeData;

    console.log(data);
    res.json(JSON.parse(removeCircularReferences(data)));
  } catch (error) {
    console.error('Error')
    res.json({ status: error });
  }
});

// NOSQL - Podatnosc w logowaniu

router.post('/login', async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .catch(err => { console.log(err); });
    if (!client) {
      return res.json({ status: "Bledne dane" });
    }

    if (!req.body.email || !req.body.password) {
      return res.json({ status: "Bledne dane" });
      
    }
    const db = client.db(MONGODB_DB_NAME);
    const users = db.collection("users");
    const hash = crypto.createHash('sha256');

    let myobj = { email: req.body.email, password: req.body.password };
    let test1 = req.body.email;
    const data = await users.findOne({ email: req.body.email, password: req.body.password });
    if (data) {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: "user"
      };
      const token = jwt.sign(payload, secretKey, options);

      res.cookie('auth', token);
      return res.json(JSON.parse(removeCircularReferences(data)));
    }
    else {
      return res.json({ status: "Nie znaleziono uzytkownika" });
    }
  } catch (error) {
    console.error('Error')
    return res.json({ status: "blad" });
  }
});

// NOSQL - Podatnosc w User-Agent

router.get('/useragent', async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .catch(err => { console.log(err); });
    if (!client) {
      return res.json({ status: "Bledne dane" });
    }

    const db = client.db(MONGODB_DB_NAME);
    const users = db.collection("userBrowser");

    let userAgent1 = req.get('User-Agent');
    
    let parts = userAgent1.split(' ');
    let firstPart = parts[0];
    let secondPart = parts.slice(1).join(' ');
    let username = req.query.username ?? "anonim";
    let myobj = { userAgent: userAgent1 };
    let filter = {
      "userAgent": firstPart,
      "browser": secondPart,
      "user": username
    };
    const operation = {
      $inc: {"count": 1}
    };

    const existDocument = await users.findOne({userAgent: parseJSONorReturnOriginal(userAgent1)});

    if (existDocument){
      const result = await users.findOneAndUpdate(filter,operation);
     return res.json(JSON.parse(removeCircularReferences(result)));

    } else {
      const result = await users.insertOne(filter);
     return res.json(JSON.parse(removeCircularReferences(result)));
    }
  
    return res.json(JSON.parse(removeCircularReferences(result)));
    

    const parsedjson = JSON.parse(`[${jsonString}]`);
    //const data = await users.findOne({ email: req.body.email, password: req.body.password });
    if (existDocument) {
      let data = await users.findOneAndUpdate(...parsedjson);

    }
    //let data = await users.findOneAndUpdate({{userAgent: firstPart, browser: secondPart, user: username},{$inc:{count:1},upsert: true,returnDocument:after}});
    if (data) {
      const payload = {
        userAgent: data.userAgent,
        browser: data.browser,
        username: username,
        role: "user"
      };

      let token = jwt.sign(payload, secretKey, options);
      data.value['auth'] = token
      res.json(JSON.parse(removeCircularReferences(data.value)));
    }
    else {
      res.json({ status: "Error" });
    }
  } catch (error) {
    console.error('Error')
    res.json({ status: "blad" });
  }
});

module.exports = router;