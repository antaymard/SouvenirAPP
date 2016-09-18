// server.js
// where your node app starts

// init project OK
require('dotenv').config();

var urlG = "http://82.239.100.156:8000";

var express = require('express');
var app = express();
var server = require('http').createServer(app); //Semble inutile
var bodyParser = require('body-parser');
var url = require("url");
var pg = require('pg');
var colors = require('colors');

var session = require('express-session'); //ADDED


app.use(express.static('public'));
// app.use(express.static(__dirname +'/node_modules/socket.io/node_modules/socket.io-client'));
app.use(express.static(__dirname + '/stockageLocal'));
app.use(express.static(__dirname + '/SiteSrc'));
app.use(express.static(__dirname + '/stockageUser'));
app.set('view engine', 'ejs');


//TEST----TEST----TEST----TEST----


app.use(session({secret: 'ssshhhhh'})); //ADDED
app.use(bodyParser.json());             //ADDED
app.use(bodyParser.urlencoded({extended:true}));  //ADDED

var sess;
var profileNom, profilePseudo, profilePNom;
// Chargement de la page index
app.get("/", function (req, res) {
  sess = req.session;
if(sess.username){
  client.query("SELECT * FROM userdb WHERE userid='" + sess.userid + "'", function(err, result) {
    if(err) {
      return console.error('PB Check pseudo'.red, err);
    }
    if(result.rows[0]) {
      userphotoid = result.rows[0].userphotoid;
      profilePseudo = result.rows[0].username;
      profileNom = result.rows[0].nom;
      profilePNom = result.rows[0].prenom;
      console.log(profilePNom);
      res.render('ejs/index', {
        userphotoid : userphotoid,
        profilePseudo : profilePseudo,
        profileNom : profileNom,
        profilePNom : profilePNom
      });
    }
  });
  // res.sendFile(__dirname + '/views/index.html');
  console.log("____Page index chargée - ID : ".green + sess.username);
}else {
  res.sendFile(__dirname + '/views/login.html');
}
});

app.post('/login',function(req,response){
  sess = req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
  client.query("SELECT * FROM userdb WHERE username='" + req.body.username + "'", function(err, res) {
    if(err) {
      return console.error('PB recall userdb'.red, err);
    }
    if(res.rows.length > 1) {
    console.log("problème : il y a " + res.rows.length + ' profil qui correspondent à ' + res.rows[0].username);
    }
    if(!res.rows[0]) {
      console.log('no match'.red);
      response.end('no match');
    }
    if(res.rows[0]) {
      if (req.body.pwd !== res.rows[0].pwd) {
        console.log('pb pwd');
        response.end('pb pwd');
      }
      if (req.body.pwd == res.rows[0].pwd) {
        console.log('id ok');
        sess.username = req.body.username;
        sess.pwd = req.body.pwd;
        sess.userid = res.rows[0].userid;
        response.end('done');
        // response.redirect('/');
      }
    }
  });
});

app.get("/register", function (req, res) {
  res.sendFile(__dirname + '/views/register.html');
  console.log("____Page register chargée ");
});

app.post('/register/new', function (req,res) {
  var pseudo = req.body.pseudo;
  var prenom = req.body.prenom;
  var nom = req.body.nom;
  var email = req.body.email;
  var pwd = req.body.pwd;
  var datebirth = req.body.datebirth;
  var gender = req.body.gender;

  client.query("INSERT INTO  userdb (username, prenom, nom,"
  + "email, pwd, custom, userfriends, userphotoid, datebirth,"
  + "gender, creationdate, lastconnexion) VALUES ('"
  + pseudo + "', '" + prenom + "', '" + nom + "', '" + email + "', '" + pwd + "', '"
  + "0" + "', '" + "0" + "', '" + "0" + "', '"
  + datebirth + "', '" + gender + "', '" + getToday() + "', '"
  + getToday() + "')",
  function(err, result) {
    if(err) {
      console.log('pb inscription user dans userdb'.red + err);
    }
    res.end('done');
  })
});

app.post('/register/checkpseudo', function (req,res) {
  var pseudo = req.body.pseudo;
  client.query("SELECT * FROM userdb WHERE username='" + pseudo + "'", function(err, result) {
    if(err) {
      return console.error('PB Check pseudo'.red, err);
    }
    if (result.rows[0]) {
      res.end('match');
    }
    if (!result.rows[0]) {
      res.end('nomatchok');
    }
  })
});


app.get('/logout',function(req,res){
req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
});
});

app.get("/changelog", function (req, res) {
  var usernb;
  var svnrnb;
  var lastsvnrdate;
  client.query("SELECT COUNT(*) FROM userdb",
  function(err, result) {
    if(err) {
      console.log("Erreur compte d'userdb".red + err);
    }
    if (result){
      usernb = result.rows[0].count;
      console.log(usernb);
    }
    client.query("SELECT COUNT(*) FROM version2",
    function(err, result) {
      if(err) {
        console.log("Erreur compte de svnr".red + err);
      }
      if (result){
        svnrnb = result.rows[0].count;
        console.log(svnrnb);
      }
      client.query("SELECT creationdate FROM version2 ORDER BY idsvnr DESC LIMIT 1",
      function(err, result) {
        if(err) {
          console.log("Erreur compte de svnr" + err);
        }
        if (result){
          console.log(result.rows);
          lastsvnrdate = result.rows[0].creationdate;
          lastsvnrdate = lastsvnrdate.toString().slice(0, -48)
          console.log(lastsvnrdate);
        }
        res.render('ejs/changelog', {
          usernb : usernb,
          svnrnb : svnrnb,
          lastsvnrdate : lastsvnrdate
        });
      });
    });
  });
  console.log("____Page changelog chargée ");
});


//TEST----TEST----TEST----TEST----over

//Upload de fichiers (images de svnrs)
var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './stockageLocal');  //définit dossier cible.
  },
  filename: function (req, file, callback) {
    idFile = file.fieldname + '-' + Date.now() + '.jpg';
    callback(null, idFile);
    console.log("Fichier enregistré ".green + idFile);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

var idSvnrDB; //id du souvenir
var idFile; //id de l'image après réception et enregistrement
var userphotoid;


//=====================SOCKET.IO================
var io = require('socket.io').listen(8080);

io.on('connection', function (socket) {
    console.log('____SOCKET : Client connecté');
    // socket.on('lol', function (data) {
      //console.log(data);
    // });
});


//Database Shit
var conString = process.env.ELEPHANTSQL_URL;
var client = new pg.Client(conString);
console.log(conString);
client.connect(function(err) {
  if(err) {
    return console.error('X-------could not connect to postgres'.red + err);
  }
  console.log("____Connected to the database".green);
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('X----PB testDBQuery - '.red + err);
    }
    console.log("____testDBQuery - ".green + result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
  });
    //client.end();
});


app.post('/searchbytag',function(request,response){
  var researchedTag = request.body.searchText;
  console.log("researchedTag = " + researchedTag + ' / ' + typeof researchedTag);
});

app.post('/recall',function(req,res){
  //recall des 10 derniers souvenirs from DB
  client.query("SELECT * FROM version2 WHERE iduser='" + sess.userid + "' ORDER BY idsvnr DESC LIMIT 10",
  function(err, result) {
    if(err) {
      console.log("X-------erreur DB recall 10 last".red + err);
    }
    console.log("____Recall OK");
    if (result){
    res.json(result.rows);
    }
  });
});


app.get('/focus/:idSvnr', function(req, res) {
  //Declarer les variables
  var result;
  var idSvnr = req.params.idSvnr;
  var idfile = 'bug';
  //Get info from DB ! = changer les variables déclarées
  client.query("SELECT * FROM version2 WHERE idsvnr='" + idSvnr + "'",
  function(err, result) {
    if(err) {
      console.log("erreur récupération focus".red);
    }
if (sess) {
  if (result.rows[0]) {
    result = result.rows[0];
    //console.log(result.idfile);
    // res.json(result.rows);
    // idfile = result.idfile; ???
    //Render le ejs avec les datas = appliquer les variables changées
    var date1 = result.date1.toString().slice(0, -48) //enlève la fin de la date (GMT)

    //individualiser les hashtags
    // var hashtags = result.hashtags.split(', ');
    // console.log("#1" + hashtags[0]);
    // console.log('#2' + hashtags[1]);

if (result.iduser == sess.userid) {
    res.render('ejs/focus', {
      idSvnr: idSvnr,
      idfile: result.idfile,
      titre: result.titre,
      lieu: result.lieu,
      date: date1,
      comments: result.comments,
      hashtags: result.hashtags,
      presentfriends: result.presentfriends,
      sharedfriends: result.sharedfriends,
      linkedtoid: result.linkedtoid,
      hour: result.hour
      //ajouter les variables obtenues par la DB !
    });//res.render
    } else {
      res.redirect('/');
    }
    }
}else{res.redirect('/');}
  }); //client
}); //app.get

app.get('/focus/:idSvnr/delete', function(req, res) {
  var idSvnr = req.params.idSvnr;
client.query("DELETE FROM version2 WHERE idsvnr='" + idSvnr + "'", function(err){
  if (err) {
    console.log('ERR de suppr de datas'.red + err);
  } else {
    console.log('suppression de souvenir ok'.green);
    res.end('done');
  }
})
});


app.get('/new', function(req, res) {
  res.sendFile(__dirname + '/views/new.html');
});

app.get('/profile', function(req, res) {
  res.render('ejs/profile', {})
});

app.post('/new/uploadFile',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.".red);
        }
        //Reçoit le fichier, le nomme et l'enregistre.
        //idFile a normalement la valeur du nom du new file.
        console.log("fichier uploadé - ".green + idFile);
        io.emit('FileUploaded', 'ok');
    });
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/new/uploadReste', urlencodedParser, function(req, res) {
  sess = req.session;
  //reçoit le reste des datas entrées.
 console.log("données formulaire 2.0 en reception");
  storageDB(sess.userid, req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId, "");
  //Doit incorporer ces données + idSvnrDB + idFile
  console.log("Données reçues : " + sess.userid, req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId);

    client.query("SELECT * FROM version2 ORDER BY idsvnr DESC LIMIT 10",
    function(err, result) {
      if(err) {
        console.log("erreur DB recall 10 last après new".red);
      }
      console.log("recall effectué après new");
      res.json(result.rows);
    });

});

//Définir date du jour
var today;
function getToday() {
today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {
    dd='0'+dd
}
if(mm<10) {
    mm='0'+mm
}
today = yyyy + '-' + mm +'-' + dd;
return today;
};

var now;
function getNow() {
  now = new Date();
  var hh = now.getHours();
  console.log(hh);
  var min = now.getMinutes();
  console.log(min);
  var ss = now.getSeconds();
  console.log(ss);
  now = hh + ':' + min + ':' + ss;
  console.log(now);
  return now;
}

function storageDB(userid, titre, lieu, idFile, typeSvnr, date1, date2, comments,
        hashtags, presentFriends, sharedFriends, linkedToId, stats) {
          var creationdate = getToday(); //récupérer la date du jour
          if (date1 == "") {
            date1 = getToday(); //string ???
          }
          if (date2 == "") {
            date2 = getToday();
          }
          hour = getNow();
          linkedToId = 0; //non fonctionnel
          //idFile = 123;
  client.query("INSERT INTO  version2 (iduser, titre, lieu, idfile,"
          + "creationdate, type, date1, hour, date2, comments, hashtags,"
          + "presentfriends, sharedFriends, linkedtoid, stats) VALUES ('"
          + userid + "', '" + titre + "', '" + lieu + "', '" + idFile + "', '"
          + creationdate + "', '" + typeSvnr + "', '" + date1 + "', '"
          + hour + "', '" + date2 + "', '" + comments + "', '"
          + hashtags + "', '" + presentFriends + "', '"
          + sharedFriends + "', '" + linkedToId + "', '" + stats + "')",
          function(err, result) {
              if(err) {
                console.log("datas DB " + "titre/lieu : " + titre, lieu, idFile
                        + " - type/dates : " + typeSvnr, date1, date2
                        + " - comments/hashtags : " + comments, hashtags
                        + " - social : " + presentFriends, sharedFriends, linkedToId);
                return console.error('X----PB inscription des données dans BD : '.red, err);
              }
              console.log("___Inscription des données dans DB ok".green);
              console.log("datas DB " + "titre/lieu : " + titre, lieu, idFile
                      + " - type/dates : " + typeSvnr, date1, date2
                      + " - comments/hashtags : " + comments, hashtags
                      + " - social : " + presentFriends, sharedFriends, linkedToId);
            });
};


//Form Shit WIP
// Create application/x-www-form-urlencoded parser
// app.post('/create_post', urlencodedParser, function (req, res) {
//   var pathname = url.parse(req.url).pathname;
//     console.log("Requête reçue pour le chemin " + pathname + ".");
// // Prepare output in JSON format
//   response = {
//     url_image:req.body.url_image,
//     titre_souvenir:req.body.titre_souvenir,
//     lieu_souvenir:req.body.lieu_souvenir,
//     date_souvenir:req.body.date_souvenir
//   };
//   inscriptionCardDB(req.body.url_image, req.body.titre_souvenir, req.body.lieu_souvenir, req.body.date_souvenir);
//   console.log(response);
//   res.json(response);
// });


// function inscriptionCardDB (urlIns, titreIns, lieuIns, dateIns) {
//   client.query("INSERT INTO testsouvenir1 (url, titre, lieu, date) VALUES ('"
//   + urlIns + "', '" + titreIns + "', '" + lieuIns + "', '" + dateIns
//   +"')", function(err, result) {
//       if(err) {
//         return console.error('pb inscription tout', err);
//       }
//       console.log("ok inscription tout");
//     });
// };

//test
app.get('/lol', function (req, res) {
  res.send('GET request to homepage');
});

// listen for requests OK
var listener = app.listen(8000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
