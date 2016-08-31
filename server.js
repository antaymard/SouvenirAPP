// server.js
// where your node app starts

// init project OK
require('dotenv').config();

var urlG = "http://82.239.100.156:8000";

var express = require('express'),
server = require('http').createServer(app),
pg = require('pg');
var app = express();
var bodyParser = require('body-parser');
var url = require("url");
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

app.use(express.static('public'));
app.use(express.static(__dirname + '/stockageLocal'))
app.set('view engine', 'ejs');

//Database Shit
var conString = process.env.ELEPHANTSQL_URL;
var client = new pg.Client(conString);
console.log(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  console.log("____Connected to the database");
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('X----PB testDBQuery', err);
    }
    console.log("testDBQuery" + result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
  });
    //client.end();
});

// Chargement de la page index
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/searchbytag',function(request,response){
  var researchedTag = request.body.searchText;
  console.log("researchedTag = " + researchedTag + ' / ' + typeof researchedTag);
});

app.post('/recall',function(req,res){
  //recall des 10 derniers souvenirs from DB
        client.query("SELECT * FROM version1 ORDER BY idsvnrdb DESC LIMIT 10",
          function(err, result) {
            if(err) {
              console.log("erreur DB recall 10 last");
            }
            console.log(result.rows);
            res.json(result.rows);
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
      if (result == undefined) {
        console.log("cette entrée n'existe pas dans le tableau");
      } else {
      result = result.rows[0];
      //console.log(result.idfile);
      // res.json(result.rows);
      // idfile = result.idfile; ???
      //Render le ejs avec les datas = appliquer les variables changées
      var date1 = result.date1.toGMTString().slice(0, -13) //enlève la fin de la date (GMT)
      //console.log(result.);

      //individualiser les hashtags
      // var hashtags = result.hashtags.split(', ');
      // console.log("#1" + hashtags[0]);
      // console.log('#2' + hashtags[1]);

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
        linkedtoid: result.linkedtoid
      } //else
        //ajouter les variables obtenues par la DB !
    });//res.render
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
        //res.end("File is uploaded");
        console.log("fichier uploadé" + idFile);
    });
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/new/uploadReste', urlencodedParser, function(req, res) {
  //reçoit le reste des datas entrées.
 console.log("données formulaire 2.0 en reception");
  storageDB(req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId,
    0); //rating = 0 car desactivé
  //Doit incorporer ces données + idSvnrDB + idFile
  console.log("request " + req.body.titreSvnr, req.body.lieuSvnr, idFile, req.body.typeSvnr,
    req.body.date1, req.body.date2, req.body.comments, req.body.hashtags,
    req.body.presentFriends, req.body.sharedFriends, req.body.linkedToId,
    0);
    res.redirect(urlG);
});

//Définir date du jour
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {
    dd='0'+dd
}
if(mm<10) {
    mm='0'+mm
}
today = mm+'-'+dd+'-'+yyyy;

function storageDB(titre, lieu, idFile, typeSvnr, date1, date2, comments,
        hashtags, presentFriends, sharedFriends, linkedToId, rating) {
          var creationdate = today; //récupérer la date du jour
          if (date1 == "") {
            date1 = "01-01-1901"; //string ???
          }
          if (date2 == "") {
            date2 = "01-01-1901";
          }
          hour = "00:00:00";
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
})

// listen for requests OK
var listener = app.listen(8000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
