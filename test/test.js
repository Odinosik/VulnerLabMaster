const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;

function parseJSONorReturnOriginal(inputString) {
    try {
        return JSON.parse(inputString);
    } catch (error) {
        return inputString;
    }
  }

router.get('/useragent', async (req, res) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .catch(err => { console.log(err); });
    if (!client) {
      return res.json({ status: "Bledne dane" });
    }
    const db = client.db(MONGODB_DB_NAME);

    const tracker = db.collection("tracker");
    let userAgent1 = req.get('User-Agent');
    const existDocument = await tracker.findOne({userAgent: parseJSONorReturnOriginal(userAgent1)});
});
