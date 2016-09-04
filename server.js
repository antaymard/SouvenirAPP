// server.js
// where your node app starts

// init project OK
require('dotenv').config();

var urlG = "http://82.239.100.156:8000";
// var urlG = "http://127.0.0.1:8000";

var express = require('express');
var app = express();
var server = require('http').createServer(app); //Semble inutile
var bodyParser = require('body-parser');
var url = require("url");
var pg = require('pg');

var session = require('express-session'); //ADDED


app.use(express.static('public'));
// app.use(express.static(__dirname +'/node_modules/socket.io/node_modules/socket.io-client'));
app.use(express.static(__dirname + '/stockageLocal'))
app.set('view engine', 'ejs');


//TEST----TEST----TEST----TEST----


app.use(session({secret: 'ssshhhhh'})); //ADDED
app.use(bodyParser.json());             //ADDED
app.use(bodyParser.urlencoded({extended:true}));  //ADDED

var sess;
// Chargement de la page index
app.get("/", function (req, res) {
  sess=req.session;
if(sess.email){
  res.sendFile(__dirname + '/views/index.html');
}else {
  res.sendFile(__dirname + '/views/signin.html');
}
  console.log("____Page index chargée - ID : " + sess.email);
});

app.post('/signin',function(req,res){
  sess = req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
  sess.email=req.body.email;
  res.end('done');
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

//TEST----TEST----TEST----TEST----over

//Upload de fichiers
var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './stockageLocal');  //définit dossier cible.
  },
  filename: function (req, file, callback) {
    idFile = file.fieldname + '-' + Date.now() + '.jpg';
    callback(null, idFile);
    console.log(idFile);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

var idSvnrDB; //id du souvenir
var idFile; //id de l'image après réception et enregistrement


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
    return console.error('X-------could not connect to postgres', err);
  }
  console.log("____Connected to the database");
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('X----PB testDBQuery - ', err);
    }
    console.log("____testDBQuery - " + result.rows[0].theTime);
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
  client.query("SELECT * FROM version1 WHERE rating='" + sess.email + "' ORDER BY idsvnrdb DESC LIMIT 10",
  function(err, result) {
    if(err) {
      console.log("X-------erreur DB recall 10 last" + err);
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
  client.query("SELECT * FROM version1 WHERE idsvnrdb='" + idSvnr + "'",
  function(err, result) {
    if(err) {
      console.log("erreur récupération focus");
    }
      result = result.rows[0];
      //console.log(result.idfile);
      // res.json(result.rows);
      // idfile = result.idfile; ???
      //Render le ejs avec les datas = appliquer les variables changées
      var date1 = result.date1.toGMTString().slice(0, -13) //enlève la fin de la date (GMT)

      //individualiser les hashtags
      // var hashtags = result.hashtags.split(', ');
      // console.log("#1" + hashtags[0]);
      // console.log('#2' + hashtags[1]);
if (result) {
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
      };
  }); //client
}); //app.get

app.get('/new', function(req, res) {
  res.sendFile(__dirname + '/views/new.html');
});

app.post('/new/uploadFile',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        //Reçoit le fichier, le nomme et l'enregistre.
        //idFile a normalement la valeur du nom du new file.
        console.log("fichier uploadé - " + idFile);
        io.emit('FileUploaded', 'ok');
    });
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/new/uploadReste', urlencodedParser, function(req, res) {
  //reçoit le reste des datas entrées.
 console.log("données formulaire 2.0 en reception");
  storageDB(req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId,
    sess.email); //rating = 0 car desactivé
  //Doit incorporer ces données + idSvnrDB + idFile
  console.log("Données reçues : " + req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId,
    sess.email);

    client.query("SELECT * FROM version1 ORDER BY idsvnrdb DESC LIMIT 10",
    function(err, result) {
      if(err) {
        console.log("erreur DB recall 10 last après new");
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

function storageDB(titre, lieu, idFile, typeSvnr, date1, date2, comments,
        hashtags, presentFriends, sharedFriends, linkedToId, rating) {
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
  client.query("INSERT INTO  version1 (titre, lieu, idfile,"
          + "creationdate, type, date1, hour, date2, comments, hashtags,"
          + "presentfriends, sharedFriends, linkedtoid, rating) VALUES ('"
          + titre + "', '" + lieu + "', '" + idFile + "', '"
          + creationdate + "', '" + typeSvnr + "', '" + date1 + "', '"
          + hour + "', '" + date2 + "', '" + comments + "', '"
          + hashtags + "', '" + presentFriends + "', '"
          + sharedFriends + "', '" + linkedToId + "', '" + rating + "')",
          function(err, result) {
              if(err) {
                console.log("datas DB " + "titre/lieu : " + titre, lieu, idFile
                        + " - type/dates : " + typeSvnr, date1, date2
                        + " - comments/hashtags : " + comments, hashtags
                        + " - social : " + presentFriends, sharedFriends, linkedToId, rating);
                return console.error('X----PB inscription des données dans BD : ', err);
              }
              console.log("___Inscription des données dans DB ok");
              console.log("datas DB " + "titre/lieu : " + titre, lieu, idFile
                      + " - type/dates : " + typeSvnr, date1, date2
                      + " - comments/hashtags : " + comments, hashtags
                      + " - social : " + presentFriends, sharedFriends, linkedToId, rating);
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
