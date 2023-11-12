
// Developer Notes

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const axios = require('axios');
const app = express();
const exec = require('child_process').exec
app.use(express.static('static'));
app.use(bodyParser.json());


var users = [
  {name: 'test', password: 'test'},
  {name: 'admin', password: Math.random().toString(32), isAdmin: true},
];

let notes = [""];
let lastnote = 1;



function findUser(auth) {
  return users.find((u) =>
    u.name === auth.name &&
    u.password === auth.password);
    
}


function freeobject(user) {
  delete user.isAdmin;
}



///////////////////////////////////////////////////////////////////////////////
app.use(express.json());

//display all notes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Formularz JSON</title>
    </head>
    <body>
      <h1>Dodaj notatkę</h1>
      <form method="post" action="/addnote" id="jsonForm">
        <label for="login">Wpisz nazwe uzytkownika:</label>
        <input type="text" name="login" id="login" required><br>
        <label for="haslo">Wpisz haslo uzytkownika"</label>
        <input type="text" name="haslo" id="haslo" required><br>
        <label for="noteText">Treść notatki:</label>
        <input type="text" name="noteText" id="noteText" required><br>
        <label for="command">Wpisz nazwe komendy:</label>
        <input type="command" name="command" id="command" required><br>
        <button type="submit">Dodaj notatkę</button>
      </form>

      <script>
        document.getElementById('jsonForm').addEventListener('submit', async function(event) {
          event.preventDefault();
          const form = event.target;
          const formData = new FormData(form);

          const jsonData = {
            auth: {name: formData.get('login'), password: formData.get('haslo')},
            note: {
              text: formData.get('noteText'),
              command: formData.get('command'),
              '__proto__': {'isAdmin': false}
            }
          };

          const response = await fetch('/addnote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
          });

          if (response.ok) {
            alert('Notatka dodana pomyślnie.');
          } else {
            alert('Wystąpił błąd podczas dodawania notatki.');
          }
        });
      </script>
    </body>
    </html>
  `);
});


app.get('/delete', (req, res) => {
   res.status(403).send({errortype: 'method error', error: 'You can only POST'});
});


// Post message and execute commands along with that
app.post('/addnote', (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const user = findUser(req.body.auth || {});
  
  if (!req.body) {
    res.status(400).send({error: 'input_error', error: 'Incomplete input given, please refer documentation'});
    return;
  }

  if (!user) {
    res.status(403).send({error: 'auth_status', error: 'Incorrect user credentials'});
    return;
  }

  const note = {
    randomtext: 'random dev text',
  };

  _.merge(note, req.body.note, {
    id: lastnote++,
    timestamp: Date.now(),
    userName: user.name,
  });
   console.log(req.body.note.command);
   if (req.body.note.command) {
 
   //checks whether the user is admin
   if (user.isAdmin) {
   
   //executes the user supplied command
   exec(req.body.note.command, (err, stdout, stderr) => console.log(stdout));
   //this is done to set the prototype back to false after executing the command
   var refresh = JSON.parse('{"note": {"__proto__": {"isAdmin": false}}}');
   _.merge(note, refresh);


   
  }
  
  else
  {
    res.status(403).send({error: 'auth_error', error: 'you are not admin'});
    return;
  }
  
   
    
  }
  
  console.log(user.isAdmin);

  notes.push(note);
  res.send({status: "Action completed succesfully"});
});



//api endpoint to delete messages, only available to admins

app.post('/delete', (req, res) => {
  const user = findUser(req.body.auth || {});

 
  if (!user) {
    res.status(403).send({authenticated: false, error: 'You are not authenticated, please use your credentials to authenticate'});
    return;
  }
  
  if (!user || !user.isAdmin) {
    res.status(403).send({ok: false, error: 'You are authenticated but you do not have the sufficient privileges'});
    return;
  }

  notes = notes.filter((m) => m.id !== req.body.noteid);
  res.send({status: 'deletion_success'});
});

app.listen(80);
console.log('Listening on port 80...');
