var express = require("express"),
colors = require('colors'),
app = express(),
session = require('express-session'),
bodyParser = require('body-parser'),
async = require('async'),
fs = require("fs");
var mongoose = require('mongoose'),
db = mongoose.connection;

var tinify = require("tinify");
tinify.key = "wpmznfn7MXAweJeAMF1uPIKBmKOYe-2r";


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
  friends : [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  birthday : Date,                          //MAYBE PROBLEM !!!!!
  current_city : String,
  living_city : String,
  pers_color : String
  // svnrs : [{type : mongoose.Schema.Types.ObjectId, ref : "Svnr"}]
});
var User = mongoose.model("User", userSchema);

var svnrSchema = mongoose.Schema({
  userid : String,
  createdBy : [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  titre : String,
  lieu : String,
  file_address : String,
  creation_date : Date,
  svnr_date : Date,
  sharedFriends: [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
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

app.get("/mobileIndex", function (req, res) {
  sess = req.session;
  if(sess.userid){
    User.find({"_id" : sess.userid}, function(err, users) {
      if(err) return console.error(err + ' home display err'.red);
      res.render('ejs/mobileIndex', {
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
    if(users.length>1) return console.error("LOGIN - il y a %s profils correspondant".red, users.length);
    if (!users[0]) {
      console.log("LOGIN - no match");
      response.end('no match');
    }
    if (users[0]) {
      if (req.body.pwd !== users[0].password) {
        console.log(req.body.pwd);
        console.log(users[0].password);
        console.log('pb pwd'.red);
        response.end('pb pwd');
      }
      if (req.body.pwd == users[0].password) {
        sess.userid = users[0]._id;
        response.end('done');
      }
    }
  })
});


//INDEX PAGE FUNCTIONS ---------------------------------------------------------

//Permet de récupérer les infos de tous les utilisateurs pour autocomplete la barre de recheche
app.post("/get_all_users_names", function (req, res) {
    User.find({}, function(err, users) {
      if(err) return console.error(err + 'err récupération all names users'.red);
      res.json(users);
    }).select("nom prenom username photo_address");
});

//Permet l'affichage de la carte de l'ami recherché dans le panel de recherche d'ami
app.post('/get_user_card_addFr', function(req, res) {
  User.find({"username" : req.body.username}, function(err, users) {
    if(err) return console.log(err + 'login err'.red);
    res.json(users);
  })
});

//Permet d'ajouter l'ami précédemment affiché par /get_user_card_addFr
app.post('/add_as_friend', function(req, res){
  sess = req.session;
  var friend_in_adding_id = req.body.friendid;
  var already_friends;

  User.find({"_id" : sess.userid}, function(err, users) {
    already_friends = String(isInArray(friend_in_adding_id, users[0].friends));

    if (already_friends == "false" && sess.userid !== friend_in_adding_id) { //Pas déjà amis
      User.update(
        {"_id" : sess.userid},
        {"$push":{ friends : friend_in_adding_id}}, function(error, user) {
          if (error) {return console.error(error);}
        res.end('added');
      });
    } if (sess.userid == friend_in_adding_id) {
      res.end('autoajout');
    }
    if (already_friends == 'true') {
      res.end('déjà amis');
    } if(err){console.log(err);res.end('err');}
  }).select("friends");
});

//Affiche mes souvenirs ajoutés par moi (avec mon _id) + oùmon id est présent en sharedFriends
app.post('/svnr_recall', function(req,res) {
  sess = req.session;
  Svnr.find({$or : [{"createdBy":sess.userid}, {"sharedFriends":sess.userid}]}, function(err, svnrs) {
    if (err) return console.error(err);
    res.json(svnrs);
  }).populate("createdBy").sort("-creation_date").limit(Number(req.body.limit)).skip(10*Number(req.body.recall));
});

//renvoie ceux qui m'ont ajouté en amis
app.post('/users_who_friended_me', function(req, res) {
  sess = req.session;
  var research = req.body.research;
  User.find({"friends" : sess.userid, "username": new RegExp(research, "i")}, function(err, users) {
    if(err) return console.log(err);
    res.json(users);
  }).select("_id username photo_address pers_color ");
});

//Enregistrer partage avec ami
app.post('/add_as_shared', function(req, res) {
  sess = req.session;
  var sharedF = req.body.sharedF;
  var idSvnr = req.body.idSvnr;
  console.log("Id Friend = ".blue + sharedF + " & idsvnr = " + idSvnr);
  Svnr.find({"_id" : idSvnr}, function(error, sv) {
    if (error) {return console.error(error);}
    // console.log("sv = ".blue + sv[0]);
    if (String(isInArray(sharedF, sv[0].sharedFriends)) == 'false') {
      console.log("shared is being added".green);
      Svnr.update({"_id": idSvnr}, {"$push":{ sharedFriends : sharedF}}, function(error, ret){
        if (error) { return console.error(error);}
        // console.log("ADDED".green);
        res.end('added');
      });
    } else {
      res.end('already_shared');
    }
  });
});

app.post('/sharedFriends_Supp', function(req, res) {
  sess = req.session;
  var idFriend = req.body.idFriend;
  var idSv = req.body.idSvnr;
  // console.log(idFriend + " " + idSv);
  Svnr.update({"_id": idSv}, {$pullAll: {sharedFriends: [idFriend]}}, function(err, ret){
    if (err) {return console.error(err);}
    // console.log("DELETED ".green + ret);
    res.json(ret);
  })
});

//Récupère les infos d'un focused Svnr
app.post("/focusedRecall", function(req, res) {
  sess = req.session;
  Svnr.find({"_id":req.body.focusId}, function(err, Fsvnr) {
    if (err) return console.log(err);
    res.json(Fsvnr);
  }).populate("sharedFriends").select("-password");
});

app.get("/focus/:id", function (req, res) {
  sess = req.session;
  Svnr.find({"_id": req.params.id}, function(err, focus){
    if(err) return console.error(err);
    var f = focus[0];
    if (sess.userid === String(focus[0].createdBy[0]._id)) {
      res.render("ejs/mobileFocus_full", {
        file_address : f.file_address,
        titre : f.titre,
        lieu : f.lieu,
        date : f.creation_date,
        description : f.description,
        idSvnr : f._id
      });
    } else {
      res.render("ejs/mobileFocus_restricted");
    }
  }).populate("createdBy");
});

//CREATION ET MODIFICATIONS DE SOUVENIRS ---------------------------------------

//creation du processus d'ajout (upload) image souvenir
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
        if(err) {return res.end("Error uploading file.".red);}
        // var CidFileSvnr = idFileSvnr.slice(0, -4) + "_compd.jpg"
        // console.log("CidFileSvnr = ".blue + CidFileSvnr);
        tinify.fromFile("ImgSouvenir/" + idFileSvnr).toFile("ImgSouvenir/" + idFileSvnr);
        console.log("fichier uploadé - ".green + idFileSvnr);
        res.render('ejs/edit_svnr', {
          userphotoid : idFileSvnr
        });
    });
});

app.post('/create_svnr', function(req,res) {
  sess = req.session;
  var re = req.body;
  var s = new Svnr({createdBy:sess.userid, titre:re.titre, lieu:re.lieu, type:re.type, svnr_date:re.svnr_date, creation_date:re.creation_date, description:re.description, file_address:re.file_address});
  s.save(function(){
    console.log("souvenir enregistré".green);
    res.end('done');
  })
});

app.post('/deleteImg', function(req, res) {
  var id =  "./ImgSouvenir/"+ req.body.file_address;
  console.log(id);
  fs.unlink(id, function(err) {
    if (err) return console.error(err);
    console.log('fichier supprimé'.green);
    res.end('done');
  })
});


//SECTION GESTION DE PROFIL ----------------------------------------------------
//Affichage de la page MyProfile
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

//Fermeture de sessions
app.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

//Affichage des cartes amis (répond à myProfile.js) = ceux que j'ai dans Ma liste
app.post('/friends_recall', function(req, res) {
  sess = req.session;
  var friend_list=[];
  User.find({"_id":sess.userid}, function(err, users) {
    if(err) return console.error(err);
    async.eachSeries(users[0].friends, function(elem, callback) {
      User.find({"_id":elem}, function(err, friendslist) {
        friend_list.push(friendslist[0]);
        callback(false);
      });
    },function(error) {
      if (error) { console.error(error);}
      res.json(friend_list);
    }
    )
  })
});

//creation du processus d'ajout (upload) photo profil
var idFileProPic;
var storageProPic =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './ImgUsers');  //définit dossier cible.
  },
  filename: function (req, file, callback) {
    idFileProPic = file.fieldname + '-' + Date.now() + '.jpg';
    callback(null, idFileProPic);
    console.log("ProPic enregistré ".green + idFileProPic);
  }
});
var uploadProPic = multer({ storage : storageProPic}).single('userPhoto');


app.post('/myProfile/updateImg', function(req, res){
  sess = req.session;
  console.log('click');
  uploadProPic(req,res,function(err) {
    if(err) {
      return res.end("Error uploading ProPic file.".red);
    }
    User.update({"_id" : sess.userid}, {"photo_address" : idFileProPic}, function(err) {
      if(err) return console.error("PB uplaod ProPic ".red + err);
      res.redirect('/myProfile');
    });
  });
});

//FONCTION UTILITAIRES ---------------------------------------------------------
//Checker si la valeur est déjà dans l'array
function isInArray(value, array) {
  return array.indexOf(value) > -1; //answer T or F
};
