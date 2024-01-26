const _ = require('lodash');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
var users = [
    { name: 'test', password: 'test'},
    { name: 'admin', password: Math.random().toString(32), isAdmin: true },
  ];
  let lastnote = 1;
  let notes = [""];

  function findUser(auth) {
    return users.find((u) =>
      u.name === auth.name &&
      u.password === auth.password);
  };


  const defaults = {};
const merge = (obj1, obj2) => {
  for (let key of Object.keys(obj2)) {
    // if keys
    const val = obj2[key];
    key = key.trim();
    if (typeof obj1[key] !== "undefined" && typeof val === "object") {
      obj1[key] = merge(obj1[key], val);
    } else {
      obj1[key] = val;
    }
  }
  return obj1;
};

const addNote = (req, res) => {
       /* 
 #swagger.tags = ['Prototype Pollution']
 #swagger.summary = 'Send Note parameters '
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    const note = req.body; // Assuming the note is sent in the request body
    console.log(req.body)
    const user = findUser(req.body.auth || {});

    if (!req.body) {
        return res.status(400).render('error',{ error: 'input_error', error: 'Incomplete input given, please refer documentation' });
    }

    if (!user) {
        return res.status(403).render('error',{ error: 'auth_status', error: 'Incorrect user credentials' });
    }

    const devnote = {
        randomtext: 'random dev text',
      };
    
      _.merge(devnote, note, {
        id: lastnote++,
        timestamp: Date.now(),
        userName: user.name,
      });

      if (req.body.note.command) {

        //checks whether the user is admin
        if (user.isAdmin) {
          let output = '';
          //executes the user supplied command
          const process = spawn(req.body.note.command);
          process.stdout.on('data', (data) => {
            output += data;
            console.log(data);
          });
          process.on('close', (code) => {
            console.log(`Proces zakończony z kodem: ${code}`);
          });
          //this is done to set the prototype back to false after executing the command
          var refresh = JSON.parse('{"note": {"__proto__": {"isAdmin": false}}}');
          _.merge(devnote, refresh);
        }
      }
    // Here, you'd normally save the note to a database, but for now, we'll just render it
    res.render('note', { note: note });
};
const readFile = (req, res) => {
  try {
           /* 
 #swagger.tags = ['Prototype Pollution']
 #swagger.summary = 'Read File'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    const query = req.query.query;
    const query2 = `{"__proto__":{"filename":"/tmp/test.txt"}}`;
    const queryObject = JSON.parse(query);
    const options = {};
    merge(options, defaults);
    merge(options, queryObject);
    res.setHeader("content-type", "text/plain; charset=utf-8");
    return res.send(getFile({}));
  }
  catch (error) {
    return res.status(400).json({ success: false, error: "Invalid JSON format in query parameter" });
  }
}

const deleteFile = (req, res) => {
             /* 
 #swagger.tags = ['Prototype Pollution']
 #swagger.summary = 'Delete File
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
  try {
    const key = req.query.key ?? "";
    const value = req.query.value ?? "";
    if (key.includes("__proto__")) {
        return res.status(400).json({ success: false, error: "Protorype Detected" });
    }
    _.set({},key,value);
    if (Object.prototype.isAdmin == true) {
      return res.status(200).send('Success flag is ...');
    }
    return res.status(401).send("Unauthorized")
  }
  catch (error) {
    res.status(400).json({ success: false, error: "Invalid " });
  }
}


module.exports = {
    addNote,
    readFile,
    deleteFile
};
