const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.1";
const MONGODB_DB_NAME = "local";
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
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

exports.search = async(req,res) => {
 /* 
 #swagger.tags = ['NoSQL Injection']
 #swagger.summary = 'Send string to Search '
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
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
}; 

exports.login = async (req, res) => {
   /* 
 #swagger.tags = ['NoSQL Injection']
 #swagger.summary = 'Send credential to login '
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
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
    
        const data = await users.findOne({ email: req.body.email, password: req.body.password });
        if (data != null) {
          const payload = {
            username: data.username,
            email: data.email,
            password: data.password,
            role: "user"
          } 
          const token = jwt.sign(payload, secretKey, options);
    
          res.cookie('auth', token);
          return res.json(JSON.parse(removeCircularReferences(data)));
        }
        else {
          return res.status(401).json({ status: "Nie znaleziono uzytkownika" });
        }
      } catch (error) {
        console.error('Error')
        return res.json({ status: "blad" });
      }
};

exports.track = async(req,res) =>{
     /* 
 #swagger.tags = ['NoSQL Injection']
 #swagger.summary = 'Track Endpoint '
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
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


    const jsontoFind = Object.fromEntries(
      Object.entries(myobj).map(([key, value]) => {
        try {
          return [key, JSON.parse(value)];
        } catch (error) {
          console.error(`Parse error for json "${key}": ${error.message}`);
          // W razie błędu parsowania, pozostaw wartość niezmienioną lub przypisz wartość domyślną
          return [key, value];
        }
      })
    );
    
    const existDocument = await users.findOne(myobj);

    if (existDocument){
      const result = await users.findOneAndUpdate(filter,operation);
    } else {
      const result = await users.insertOne(filter);
    }
  
    return res.json(JSON.parse(removeCircularReferences(existDocument)));
    

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
}; 