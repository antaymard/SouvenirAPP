var express = require("express"),
colors = require('colors'),
app = express(),
session = require('express-session'),
bodyParser = require('body-parser');

var mongoose = require('mongoose'),
db = mongoose.connection;


app
.use(express.static('public'))
.use(express.static('./ImgSouvenir'))
.use(express.static('./SiteSrc'))
.use(express.static('./ImgUsers'))
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended:true}))
.set('view engine', 'ejs')
.use(session({secret: 'ssshhhhh'}))
.listen(8000);


mongoose.connect('mongodb://antaymard:splinTer00@ds135039.mlab.com:35039/svnrapp');
mongoose.connection.on("error", function() {
  console.log('Erreur connexion svnrapp DB'.red);
});
mongoose.connection.on('open', function() {
  console.log('Connexion réussie svnrapp DB'.green);
});


var userSchema = mongoose.Schema({
  userid : Number,
  username : String,
  prenom : String,
  nom : String,
  email : String,
  password : String,
  photo_adress : String,
  friends_id : Array,
  birthday : Date,                          //MAYBE PROBLEM !!!!!
  living_city : String
});
var User = mongoose.model("User", userSchema);

var svnrSchema = mongoose.Schema({
  svnrid : Number,
  userid : Number,
  titre : String,
  file_adress : String,
  creation_date : Date,
  type : String,
  description : String,
  hastags : Array
});
var Svnr = mongoose.model("Svnr", svnrSchema);


var sess;

app.get("/", function (req, res) {
  sess = req.session;
  if(sess.userid){
    User.find({"_id" : sess.userid}, function(err, users) {
      if(err) return console.error(err + 'home display err'.red);
      res.render('ejs/index', {
        userphotoid : users[0].photo_adress,
        profileNom : users[0].nom,
        profilePNom : users[0].prenom
      });
    });
  }else {
    res.sendFile(__dirname + '/views/login.html');
  };
  // var u = new User({ username : "test1"});
  // u.save();
});

app.post('/login', function(req, response) {
  sess = req.session;
  User.find({"username" : req.body.username}, function(err, users) {
    if(err) return console.log(err + 'login err'.red);
    sess.userid = users[0]._id;
    response.end('done');
  })
});

app.post("/get_all_users_names", function (req, res) {
    User.find({}, function(err, users) {
      if(err) return console.error(err + 'err récupération all names users'.red);
      res.json(users);
    }).select("nom prenom username photo_adress");
});

app.post('/get_user_card_addFr', function(req, res) {
  User.find({"username" : req.body.username}, function(err, users) {
    if(err) return console.log(err + 'login err'.red);
    res.json(users);
  })
});

app.post('/add_as_friend', function(req, res){
  // if (isInArray(req.))
  //AJOUTER _ID dans friends id array. Comment faire pour retirer ? Comment faire pour checker si ami ?
  res.end('ok');
});

//Checker si la valeur est déjà dans l'array
function isInArray(value, array) {
  return array.indexOf(value) > -1; //answer T or F
};
