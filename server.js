var express = require("express"),
colors = require('colors'),
app = express(),
session = require('express-session'),
bodyParser = require('body-parser'),
async = require('async'),
fs = require("fs");
var mongoose = require('mongoose'),
db = mongoose.connection;
var Slack = require('slack-node');

webhookUri = "__uri___";

slack = new Slack();
slack.setWebhook("https://hooks.slack.com/services/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");

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
  .listen(process.env.PORT || 8000);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://antaymard:splinTer00@ds135039.mlab.com:35039/svnrapp');
mongoose.connection.on("error", function() {
  console.log('Erreur connexion svnrapp DB'.red);
  SendToSlack("*Erreur de connexion* à la database Svnr");
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
  file_address : String, //deprecated
  file_name : Array,
  file_addresses : Array,
  svnr_date_in : {
    day: Number,
    month: Number,
    year: Number},
  svnr_date_out : {
    day: Number,
    month: Number,
    year: Number},
  creation_date : Date,
  created_date : {
    day: Number,
    month: Number,
    year: Number},
  svnr_date : Date,
  sharedFriends: [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  type : String,
  description : String,
  hastags : Array,
  presentFriends: [{type : mongoose.Schema.Types.ObjectId, ref : "User"}]
});
var Svnr = mongoose.model("Svnr", svnrSchema);
// svnrSchema.index({titre: 'text'});

var notifSchema = mongoose.Schema({
  createdBy : [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  targetTo : [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  idSvnr : [{type : mongoose.Schema.Types.ObjectId, ref : "Svnr"}],
  creationDate : Date,
  type : Number,
  beenRead : Array
});
var Notif = mongoose.model('Notif', notifSchema);

var commentSchema = mongoose.Schema({
  svnrId : String,
  createdBy : [{type : mongoose.Schema.Types.ObjectId, ref : "User"}],
  content : String,
  creationDate : Date,
  beenRead : Array,
  beenEdited : Array
});
var Comments = mongoose.model('Comments', commentSchema);

var sess;

app.get("/", function (req, res) {
  sess = req.session;
  if(sess.userid){
    User.find({"_id" : sess.userid}, function(err, users) {
      if(err) {
        SendToSlack('*Home Display Erreur : *\n' + err);
        return console.error(err + ' home display err'.red)};
      res.render('ejs/mobileIndex', {
        userphotoid : users[0].photo_address,
        profileNom : users[0].nom,
        profilePNom : users[0].prenom
      });
      SendToSlack(users[0].prenom + " "+ users[0].nom + " connecté à son compte");
    });
  }else {
    res.sendFile(__dirname + '/views/login.html');
  };
  // var u = new User({ username : "test1"});
  // u.save();
});

app.get("/test", function(req, res){

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
      SendToSlack(users[0].prenom + " "+ users[0].nom + " connecté à son compte sur version mobile");
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

app.post('/stop', function(req, response) {
  process.exit(1);
});

//Récupérer les infos de l'utilisateur actif
app.post('/MyInfo', function(req, res) {
  sess = req.session;
  User.find({"_id" : sess.userid}, function(err, infos) {
    if (err) {  return console.error(err);  }
    if (infos) {
      console.log(infos);
      res.json(infos);
    }
  })
});

// ================= FUNCTIONS DATA CLEANING

// app.get('/script/removekey', function(req,res){
//   Svnr.findOne({ "toBeDeletedSV": { $exists: true}}, function(err, result) {
//     if (err) {
//       return console.error("REMOVE KEY PB".red + err);
//     }
//     console.log("processing on ".green + result.titre);
//     Svnr.update({"_id": result._id},
//       {$unset : {"toBeDeletedSV": 1}},
//       function(error, done) {
//         if (error) {
//           return console.error(error);
//         }
//         Svnr.count({ "toBeDeletedSV": { $exists: true}}, function(er, doe) {
//           console.log(doe);
//         })
//       })
//       res.redirect('/script/removekey');
//   })
// });

app.get("/script/changeFileAdress", function(req, res) {
  console.log("working...".green);

  // Svnr.update({"_id":"5955a189e9f8041d10a9a4ba"}, {"toBeDeletedSV" : []},
  // function(er, num){
  //   if (er) console.log(er);
  //   console.log("SUCCESS - nombre modifiés : ".green + num.nModified);
  // })

  var old_data;


  Svnr.findOne({ "file_adresses": { $exists: true}},function(err, done) {
    if (err) {
      return console.error("script ERROR : ".red + err);
    }
    if (!done.file_adresses) {
      return console.log("DONNEES MANQUANTES ".red + done );
    } else {

      old_data = done.file_address;

    Svnr.update(
     {"_id": done.id},
     {
       $unset:
       {
         "file_adresses" : ""
       }
     },
    //  {multi:true},
       function(error, donee){
         if (error) {
           return console.error(error);
         }
        //  res.json({
        //    "done" : donee,
        //    "Entry Affected" : done._id,
        //    "Titre" : done.titre,
        //    "Number Affected" : donee.n,
        //    "OLD" : old_data
        //  });

        res.redirect("/script/changeFileAdress");
      });
    }
 });
 Svnr.count({ "file_adresses": { $exists: true}},function(err, count) {
   console.log(count);
 })
});
// function returnMonth (month_numb) {
//   switch (month_numb) {
//     case "Jan":
//     return 1;
//     break;
//     case "Feb":
//     return 2;
//     break;
//     case "Mar" :
//     return 3;
//     break;
//     case "Apr":
//     return 4;
//     break;
//     case "May":
//     return 5;
//     break;
//     case "Jun":
//     return 6;
//     break;
//     case "Jul":
//     return 7;
//     break;
//     case "Aug":
//     return 8;
//     break;
//     case "Sep":
//     return 9;
//     break;
//     case "Oct":
//     return 10;
//     break;
//     case "Nov":
//     return 11;
//     break;
//     case "Dec":
//     return 12;
//     break;
//   }
// }


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
  console.log(req.body.search);
  User.find({"username" : new RegExp(req.body.search, "i")}, function(err, users) {
    if(err) return console.log(err + 'login err'.red);
    res.json(users);
  }).select("nom prenom username photo_address birthday _id");
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
          addANotif (2, [], sess.userid, friend_in_adding_id, new Date())
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


// NOTE: Work in Progress
app.post('/searchSvnr', function(req,res) {
    sess = req.session;
    var query_word = req.body.query_word;
    var query_type = "description";
    console.log(query_word);

    Svnr.find()
    .and([
      { $or: [{"createdBy": sess.userid}, {"sharedFriends":sess.userid}] },
      { $or: [{"description": new RegExp(query_word, "i")}, {"titre": new RegExp(query_word, "i")}] }
    ])
    .populate("createdBy").sort("-creation_date")
    .exec(
      function(err, resultSvnrs) {
        if (err) return console.error(err);
        res.json(resultSvnrs);
      });

});

//========  IMPORTANT  ========
//Affiche mes souvenirs ajoutés par moi (avec mon _id) + oùmon id est présent en sharedFriends
app.post('/svnr_recall', function(req,res) {
  sess = req.session;
  Svnr.find({$or : [{"createdBy":sess.userid}, {"sharedFriends":sess.userid}]}, function(err, svnrs) {
    if (err) return console.error(err);
    res.json(svnrs);
  }).populate("createdBy").sort("-creation_date").limit(Number(req.body.limit)).skip(10*Number(req.body.recall));
});




//Supprimer un partage de souvenir
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

app.get('/getRandomSvnr', function(req,res) {
  sess = req.session;
  Svnr.count({$or : [{"createdBy":sess.userid}, {"sharedFriends":sess.userid}]}).exec(function (err, count) {
    //Get a random Entry
    var random = Math.floor(Math.random() * count);
    Svnr.findOne({$or : [{"createdBy":sess.userid}, {"sharedFriends":sess.userid}]}).skip(random).exec(
      function(err, result) {
        if (err) {return console.error(err)};
          console.log("clicked");
          res.json(result);
      }
    )
  })
})

// ============== FOCUS =============================================

app.get("/focus/:id", function(req, res) {
  sess = req.session;
  Svnr.findOne({"_id" : req.params.id}).populate("createdBy").populate("sharedFriends")
  .exec(function(err1, result1){
      res.render('ejs/mobileFocus', {
             f : result1
            });
            console.log(result1.sharedFriends.length);
    })
});

// ==============ALL AJAX FOR FOCUS SVNR ============================

//Récupère les infos d'un focused Svnr
app.post("/focusedRecall", function(req, res) {
  sess = req.session;
  Svnr.find({"_id":req.body.focusId}, function(err, Fsvnr) {
    if (err) return console.log(err);
    res.json(Fsvnr);
  }).populate("createdBy");
});

//Récupère les amis présents
app.post("/getPresentFriends", function (req, res) {
  Svnr.find({"_id": req.body.idSvnr}, function (err, presentFriends) {
    if (err) {return console.error(err);}
    res.json(presentFriends);
  }).populate("presentFriends");
});

//Récupère les amis avec lesquels le souvenir est partagé
app.post("/getSharedFriends", function (req, res) {
  Svnr.find({"_id": req.body.idSvnr}, function (err, sharedFriends) {
    if (err) {return console.error(err);}
    res.json(sharedFriends);
  }).populate("sharedFriends");
});

//Enregistrer partage avec ami
app.post('/addSharedFriend', function(req, res) {
  sess = req.session;
  var idFriend = req.body.idFriend;
  var idSouv = req.body.idSouv;
  var targetFriends = req.body.targetFriends;
  Svnr.find({"_id" : idSouv}, function(error, sv) {
    if (error) {return console.error(error);}
    if (String(isInArray(idFriend, sv[0].sharedFriends)) == 'false') {
      console.log("shared is being added".green);
      Svnr.update({"_id": idSouv}, {"$push":{ sharedFriends : idFriend}}, function(error, ret){
        if (error) { return console.error(error);}
        // console.log("ADDED".green);
        addANotif(1, idSouv, sess.userid, targetFriends, new Date());
        res.end('added');
      });
    } else {
      res.end('already_shared');
    }
  });
});

//Ecrit un nouveau Comment
app.post("/addComment", function (req, res) {
  sess = req.session;
  var cont = req.body;
  var c = new Comments({
      svnrId : cont.idSouv,
      createdBy:sess.userid,
      content: cont.content,
      creationDate : cont.date
    });
  c.save(function(){
    console.log("nouveau comment ajouté");
    //Ajoute une notification
    addANotif(0, cont.idSouv, sess.userid, cont.targetFriends, cont.date);
    res.end('done');
  })
});

//Récupère les nouveaux commentaires
app.post("/getComments", function (req, res) {
  Comments.find({"svnrId": req.body.idSvnr}, function (err, comments) {
    if (err) {return console.error(err);}
    res.json(comments);
  }).populate("createdBy");
});

//Fonction d'ajout de notification
function addANotif (type, idSvnr, userId, targetTo, creationDate) {
  suppFromArray(userId, targetTo);
  var n = new Notif({
    createdBy : userId,
    targetTo : targetTo,
    idSvnr : idSvnr,
    type : type,
    creationDate : creationDate,
    beenRead : []
  });
  n.save(function(err, u){
    if (err) {return console.error(err);}
    console.log('nouvelle notif ajoutée');
  })
};

//Récupérer mes notifications
app.post("/getNotifs", function (req, res) {
  sess = req.session;
  Notif.find({"targetTo": sess.userid}, function (err, notifs) {
    if (err) {return console.error(err);}
    res.json(notifs);
  }).populate("createdBy").sort("-creationDate");
});

//Supprimer une notification (id du user dans la notif)
app.post("/supprNotif", function(req, res) {
  sess = req.session;
  var idN = req.body.idN;
  console.log("called");
  Notif.update( {"_id": idN}, { $pullAll: {"targetTo": [sess.userid] } } )
    .exec(function(err, r){
      if (err) {return console.error(err);}
      res.json("ok");
    });
});

// ==============ALL AJAX FOR EDIT SVNR ============================

//Ajoute un ami présent
app.post("/addPresentFriends", function (req, res) {
  Svnr.find({"_id": req.body.idSvnr}, function (err, presentFriends) {
    if (err) {return console.error(err);}
    res.json(presentFriends);
  }).populate("presentFriends");
});

//Renvoie mes amis
//A Ajouter plus tard = search engine
app.post('/getAllMyFriends', function(req, res) {
  sess = req.session;
  User.find({"friends" : sess.userid}, function(err, users) {
    if(err) return console.log(err);
    res.json(users);
  }).select("_id username photo_address nom prenom");
});



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
    SendToSlack("Nouvelle photo uploadée et enregistrée - " + idFileSvnr);
  }
});


// var uploadSvnr = multer({ storage : storageSvnr}).single('userPhoto');
var uploadSvnr = multer({ storage : storageSvnr}).single('userPhoto');


// app.post('/new/uploadFile',function(req,res){
//     uploadSvnr(req,res,function(err) {
//         if(err) {return res.end("Error uploading file.".red);}
//         // var CidFileSvnr = idFileSvnr.slice(0, -4) + "_compd.jpg"
//         // console.log("CidFileSvnr = ".blue + CidFileSvnr);
//         tinify.fromFile("ImgSouvenir/" + idFileSvnr).toFile("ImgSouvenir/" + idFileSvnr);
//         console.log("fichier uploadé - ".green + idFileSvnr);
//         res.render('ejs/edit_svnr', {
//           userphotoid : idFileSvnr
//         });
//     });
// });

app.get('/newSvnr', function(req, res) {
  sess = req.session;
  if (sess.userid) {
    res.render('ejs/edit_svnr', {
    });
  } else {
    res.sendFile(__dirname + '/views/login.html');
  }
});

app.post('/create_svnr', function(req,res) {
  sess = req.session;
  var svnr = req.body.svnr;
  var s = new Svnr({createdBy:sess.userid, titre:svnr.titre, lieu:svnr.lieu, svnr_date:svnr.date, creation_date: new Date(), description: svnr.description, file_addresses: svnr.file_addresses});
  s.save(function(err, dat){
    console.log("souvenir enregistré".green);
    console.log(dat);
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

app.post('/getSvnrNumber', function(req,res) {
  sess = req.session;
  Svnr.count({$or : [{"createdBy":sess.userid}, {"sharedFriends":sess.userid}]}, function(err, number) {
    if (err) return console.error(err);
    res.json(number);
  });
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

function suppFromArray(value, array) {
		var index = array.indexOf(value);
    if (array.indexOf(value) > -1) {
      console.log("supprimé de l'array");
      array.splice(index ,1);
      return array;
    } else {
      console.log("pas de supp de l'array");
    }
  };

function SendToSlack (message) {
// slack.webhook({
//   channel: "#server_feedback",
//   username: "webhookbot",
//   text: message
// }, function(err, response) {
//   if (err) { return console.error(err);}
// });
};

function returnMonthName (numb) {
  var num = numb -1
  var listt = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return listt[num];
}
