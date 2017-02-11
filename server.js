var express = require("express"),
colors = require('colors'),
app = express(),
session = require('express-session'),
bodyParser = require('body-parser'),
async = require('async');

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

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://antaymard:splinTer00@ds135039.mlab.com:35039/svnrapp');
mongoose.connection.on("error", function() {
  console.log('Erreur connexion svnrapp DB'.red);
});
mongoose.connection.on('open', function() {
  console.log('Connexion réussie svnrapp DB'.green);
});


var userSchema = mongoose.Schema({
  username : String,
  prenom : String,
  nom : String,
  email : String,
  password : String,
  photo_address : String,
  friends_id : Array,
  birthday : Date,                          //MAYBE PROBLEM !!!!!
  current_city : String,
  living_city : String
});
var User = mongoose.model("User", userSchema);

var svnrSchema = mongoose.Schema({
  userid : String,
  titre : String,
  lieu : String,
  file_address : String,
  creation_date : Date,
  svnr_date : Date,
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
      if(err) return console.error(err + ' home display err'.red);
      res.render('ejs/index', {
        userphotoid : users[0].photo_address,
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
    }).select("nom prenom username photo_address");
});

app.post('/get_user_card_addFr', function(req, res) {
  User.find({"username" : req.body.username}, function(err, users) {
    if(err) return console.log(err + 'login err'.red);
    res.json(users);
  })
});

app.post('/add_as_friend', function(req, res){
  sess = req.session;
  var friend_in_adding_id = req.body.friendid;
  var already_friends;

  User.find({"_id" : sess.userid}, function(err, users) {
    already_friends = String(isInArray(friend_in_adding_id, users[0].friends_id));

    if (already_friends == "false" && sess.userid !== friend_in_adding_id) { //Pas déjà amis
      User.findOne({"_id" : sess.userid}, function(err, u){
        if(err){return console.error(err + " erreur inscription ami".red);}
        if(!u) {console.log('aucun match inscription ami'.red);return;}
        u.friends_id.push(friend_in_adding_id);
        u.save(function(error, user) {
          if(error){return console.error(error);}
          res.end('added');
        });
      });
    } if (sess.userid == friend_in_adding_id) {
      res.end('autoajout');
    }
    if (already_friends == 'true') {
      res.end('déjà amis');
    } if(err){console.log(err);res.end('err');}
  }).select("friends_id");
});

app.get('/myProfile', function(req, res){
  sess = req.session;
  if(sess.userid){
    User.find({"_id" : sess.userid}, function(err, users) {
      if(err) return console.error(err + 'home display err'.red);
      if (!users[0].photo_address) {users[0].photo_address="http://placehold.it/350x150";}
      // if (users[0].photo_address) {users[0].photo_address="/" + users[0].photo_address;}
      res.render('ejs/myProfile', {
        userphotoid : users[0].photo_address,
        profileNom : users[0].nom,
        profilePNom : users[0].prenom,
        birthday : users[0].birthday,
        friends_id : users[0].friends_id,
        email : users[0].email,
        username : users[0].username,
        current_city : users[0].current_city,
        living_city : users[0].living_city
      });
    });
  }else {
    res.sendFile(__dirname + '/views/login.html');
  };
  // var u = new User({ username : "test1"});
  // u.save();
});

app.post('/friends_recall', function(req, res) {
  sess = req.session;
  var friend_list=[];
  User.find({"_id":sess.userid}, function(err, users) {
    if(err) return console.error(err);
    async.eachSeries(users[0].friends_id, function(elem, callback) {
      User.find({"_id":elem}, function(err, friendslist) {
        friend_list.push(friendslist[0]);
        console.log("test ".yellow + friend_list);
        callback(false);
      });
    },function(error) {
      if (error) { console.error(error);}
      console.log(friend_list);
      res.json(friend_list);
    }
    )
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

app.post('/svnr_recall', function(req,res) {
  sess = req.session;
  Svnr.find({"userid":sess.userid}, function(err, svnrs) {
    if (err) return console.error(err);
    console.log(svnrs);
    res.json(svnrs);
  });
});

var idFileSvnr;
var multer  =   require('multer');
var storageSvnr =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './ImgSouvenir');  //définit dossier cible.
  },
  filename: function (req, file, callback) {
    idFileSvnr = file.fieldname + '-' + Date.now() + '.jpg';
    callback(null, idFileSvnr);
    console.log("Fichier enregistré ".green + idFileSvnr);
  }
});
// var uploadSvnr = multer({ storage : storageSvnr}).single('userPhoto');
var uploadSvnr = multer({ storage : storageSvnr}).single('userPhoto');

app.post('/new/uploadFile',function(req,res){
    uploadSvnr(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.".red);
        }
        console.log("fichier uploadé - ".green + idFileSvnr);
        res.render('ejs/edit_svnr', {
          userphotoid : idFileSvnr
        });
    });
});

app.post('/create_svnr', function(req,res) {
  var re = req.body;
  var s = new Svnr({userid:sess.userid, titre:re.titre, lieu:re.lieu, type:re.type, svnr_date:re.svnr_date, description:re.description, file_address:re.file_address});
  s.save(function(){
    console.log("souvenir enregistré".green);
    res.end('done');
  })
});



//FONCTION
//Checker si la valeur est déjà dans l'array
function isInArray(value, array) {
  return array.indexOf(value) > -1; //answer T or F
};
