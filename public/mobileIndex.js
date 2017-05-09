var postData = 1, all_users_listNFO;
var dataS, dataA;
var o;

$( document ).ready(function() {
  $('.modal').modal();

  //RECALL DES SOUVENRIS
  var recall = 1, svnrs;
  $.post("/svnr_recall", {recall:recall}, function (svnrs) {
    // console.log(svnrs);
    if(svnrs) {
      var n;
      for (n in svnrs) {
        var s = svnrs[n];
        displaySvnr(s.titre, s.file_address, s.description, s._id, s.createdBy[0].username, s.createdBy[0].photo_address, s.creation_date);
        console.log(s);
      }
      // displayFocusedSvnr(svnrs[0]._id);
      $('.tooltipped').tooltip({delay: 50});
      hidePannelFct();
    }
  });

  //CHARGER LES NOMS DES USERS POUR L'AUTOCOMPLETE DE LA RECHERCHE
  $.ajax({
    type : "post",
    url  : "/get_all_users_names",
    data : postData,
    success: function(all_users_listNFO, textStatus, jqXHR) {
      var auto = "{"
      var i;
      for (i in all_users_listNFO) {
        auto += '"' + all_users_listNFO[i].username + '" : "' + all_users_listNFO[i].photo_address + '",'
      };
      auto = auto.slice(0, -1);
      auto += "}"
      auto = jQuery.parseJSON(auto)
      $('#input_addFriends').autocomplete({
        data: auto,
        limit: 20,
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  });
});

//AFFICHER LA CARTE CORRESPONDANT A L'AMI RECHERCHE
$('#search_friend').click(function() {
  var username = $('#input_addFriends').val();
  $('#modal_card').empty();
  $.post("/get_user_card_addFr",{username:username},function(data){
    if(data) {

      var user_age = calcAge(data[0].birthday);
      $('#modal_card').append(
        '<div class="card horizontal" style="max-height:220px; max-width:70%; margin-right:auto; margin-left:40px;">'
        + '<div class="card-image" style="width:30%;">'
        + '<img style="max-height:100%; max-width:100%; object-fit:cover" src="' + data[0].photo_address +'">'
        + '</div>'
        + '<div class="card-stacked">'
        + '<div class="card-content">'
        + '<p style="font-size:19px;font-weight:500">'+ data[0].username + '</p>'
        + '<p style="font-size:17px;font-weight:400">'+ data[0].prenom + ' ' + data[0].nom + '</p>'
        + '<p style="font-size:15px;font-weight:400">de '+ user_age + " ans, de " + data[0].living_city + '</p>'
        + '<p style="font-size:15px;font-weight:400;margin-top:5px" class="teal-text">Actuellement à '+ data[0].current_city + '</p></div>'
        + '<div class="card-action">'
        + '<a id="add_as_friend_btn" class="green-text" style="cursor:pointer;float : right;">AJOUTER</a>'
        + '</div></div></div>'
      );

      //REACTION LORS DE L'AJOUT DE L'AMI EN APPUYANT SUR LE BOUTON DE LA CARTE
      $('#add_as_friend_btn').click(function(){
        $.post("/add_as_friend",{friendid:data[0]._id},function(data2){
          if(data2 == 'added') {
            Materialize.toast(data[0].prenom + ' a reçu votre demande', 3000);
            $('#modal_card').modal('close');
          }
          if(data2 == 'déjà amis') {
            Materialize.toast("Déjà amis ! Pour supprimer un ami, aller dans vos options de profil", 3000);
          }
          if(data2 == 'autoajout') {
            Materialize.toast("Vous êtes déjà votre meilleur ami :)", 3000);}
            if(data2 == 'err') {      //ICI CA bug niveau message d'alerte d'erreur
            // Materialize.toast("Erreur du serveur", 3000);
          }
        });
      });
    }
    else{Materialize.toast("No match", 3000);}
  });
});

//Affichage du souvenir Focused
// function displayFocusedSvnr(focusId) {
//
//   $.post("/focusedRecall", {focusId:focusId}, function(data4) {
//     if (data4) {
//
//       dataA = data4[0]._id;
//
//       $("#JSprintedSpace").empty();
//
//       $("#JSprintedSpace").append(
//         '<div class="focusImgSpace col l6 m6">'
//         +    '<img id="imgFocus" onclick="seeFullScreenImg()" class="focusImg" src="'+ data4[0].file_address +'" alt="">'
//         + '</div>'
//
//         + '<div class="col l4 m6">'
//         + '<div id="minusPx">'
//         +   '<div class="focusDataSpace" id="topSpace">'
//         +       '<h1>'+ data4[0].titre +'<span style="float:right"><button class="waves-effect waves-teal btn-flat"><i class="tiny material-icons grey-text">mode_edit</i></span></button></h1>'
//         +       '<h2>'+ data4[0].lieu +'</h2>'
//         +       '<h3>'+ data4[0].svnr_date.slice(0, -14) +'</h3>'
//         +   '</div>'
//
//         +   '<div class="focusDataSpace" id="descSpace">'
//         +       '<p>'+ data4[0].description +'<span style="float:right"><button class="waves-effect waves-teal btn-flat"><i class="tiny material-icons grey-text">mode_edit</i></span></button></p>'
//         +   '</div></div>'
//
//         +   '<div class="focusDataSpace" id="sharedFriendsSpace">'
//         +     '<div class="">'
//         +         '<input placeholder="Partager avec des amis" id="sharedFriends" type="text" class="autocomplete validate">'
//         +     '</div>'
//         +     '<div id="add_as_sharedSpace"></div>'
//         +   '</div>'
//         + '</div>'
//
//         +  '<div class="col l2 m0" style="color: rgba(0,0,0,0.3);">'
//         +    'Comments'
//         +  '</div>'
//         + '<button id="closeStorySpace_btn" onclick="hidePannelFct()"><i class="material-icons">view_carousel</i></button>'
//       );
//       };
//
//       var t;
//       for (t in data4[0].sharedFriends) {
//         $("#add_as_sharedSpace").append(
//           '<div class="divSharedFr" style="float:left;">'
//           + '<img data-position="top" data-delay="50" data-tooltip="' + data4[0].sharedFriends[t].username
//             + '" class="tooltipped img_sharedFr" src="'+ data4[0].sharedFriends[t].photo_address +'" alt="">'
//             + '<button class="sharedSupp_btn red" onclick="sharedFriendsSupp('+ "'" + data4[0].sharedFriends[t]._id + "'" +')"><i class="tiny material-icons">delete</i></button>'
//           + '</div>'
//         )
//       };
//
//       $('.tooltipped').tooltip({delay: 50});
//
//       //Dès qu'une lettre est entrée dans le champ addFriends, déclence la fct
//       var timeoutId = 0;
//       $("#sharedFriends").keypress(function(){
//         o = 0;
//           clearTimeout(timeoutId);
//           timeoutId = setTimeout(acsharedFriends, 300);
//       });
//     }); //END of POST
//
// };//FIN displayFocusedSvnr


function sharedFriendsSupp(idFriend) {
  console.log(dataA);
  $.post("/sharedFriends_Supp",{idFriend:idFriend, idSvnr:dataA},function(data6){
    if(data6) {
      //supprimer la bulle côté client
      console.log(data6);
      Materialize.toast("Partage supprimé", 3000);

      displayFocusedSvnr(dataA);

    }
  })
};

//Partager le souvenir avec un ami
function acsharedFriends() {
  var researchInput = $("#sharedFriends").val();
  $.post("/users_who_friended_me",{research:researchInput},function(data5){
    if(data5) {

      dataS = data5[0];
      var auto = "{"
      var i;
      for (i in data5) {
        auto += '"' + data5[i].username + '" : "' + data5[i].photo_address + '",'
      };
      auto = auto.slice(0, -1);
      auto += "}"
      auto = jQuery.parseJSON(auto);
      console.log(data5);
      var timeoutId = 0;
      $('#sharedFriends').autocomplete({
        data: auto,
        limit: 5,
        onAutocomplete: function(val) {

          o ++;
          if (o == 1) {
            $.post("/add_as_shared", {sharedF:dataS._id, idSvnr:dataA}, function(data6){
              if (data6 == 'added') {

                displayFocusedSvnr(dataA);

                // $("#add_as_sharedSpace").append(
                //   '<img data-position="top" data-delay="50" data-tooltip="' + dataS.username
                //     + '" class="tooltipped img_sharedFr" src="'+ dataS.photo_address + '">'
                // );
                Materialize.toast("Partagé", 3000);
                $('.tooltipped').tooltip({delay: 50});
              }
              if (data6 == 'already_shared') {
                console.log('already_shared');
                Materialize.toast("Déjà partagé !", 3000);
              }
            });
          }
        }
      });
    }
  });
};



//------------------------------------------------------------------------------
  //Affichage du panel inférieur Story avec svnrs
  function displaySvnr(titre, img_address, description, idsvnr, cBusername, cBphotoAdress, creation_date) {
    $("#svnr_recall_space").append(
      '<div onclick="displayFocusedSvnr('+ "'" + idsvnr + "'" +')" class="myCard">'
      + '<div class="topMyCardDiv">'
        + '<img class="who_posted" style="border: 2px solid white '// + cBcolor
        + '" src="' + cBphotoAdress + '">'
        + '<div class="cBusername">' + cBusername
          + '<span class="creationDate"> - ' + calcAgo(creation_date) + '</span>'
        + '</div>'
      + '<div class="titreDiv">' + titre + '</div>'
      + '</div>'
      + '<img src="'+ img_address + '">'
      + '<div class="descriptionDiv">'+ description + '</div>'
      + '</div>'
    );
    // var imageWidth = 210;
    // $("#svnr_recall_space").width($(".myCard").length*imageWidth);
  };


  $("#input_photo").change(function() {
    console.log('click');
    //Envoie file
    $('#fileUp').submit();
  });

// $('#fileUp').change(function(){
//   console.log("changed");
//   $("#Header").append(
//     '<div style="margin-left: 80px;" class="preloader-wrapper small active">'
//   +   '<div class="spinner-layer spinner-green-only">'
//   +    '<div class="circle-clipper left">'
//   +      '<div class="circle"></div>'
//   +    '</div><div class="gap-patch">'
//   +      '<div class="circle"></div>'
//   +    '</div><div class="circle-clipper right">'
//   +      '<div class="circle"></div>'
//   +    '</div>'
//   +  '</div></div>'
// )
// });

  //FUNCTIONS ------------------------------------------------------------------
  //Checker si la valeur est déjà dans l'array
  function isInArray(value, array) {
    return array.indexOf(value) > -1; //answer T or F
  };

  function calcAge(dateString) {
    var birthday = +new Date(dateString);
    return ~~((Date.now() - birthday) / (31557600000));
  };

  function calcAgo(dateString) {
    var creaDate = +new Date(dateString);
    var result = ((Date.now() - creaDate) / (86400000));
    if (result > 30) {
      return "il y a " + ~~(result/30) + " mois";
    }
    if (result<2 && result >1) {
      return "il y a " + ~~(result) + " jour";
    }
    if (result>=1) {
      return "il y a " + ~~(result) + " jours";
    }
    if (result<1) { //si moins d'un jour
      result = result * 24; //on passe en heures
      if (result<1) { //si moins d'une heure
        result = result * 60; // on passe en minutes
        return "il y a " + ~~(result) + " minutes";
      } else {
      return "il y a " + ~~(result) + " heures";
      }
    }
  };

var k = 1; //1 = ouvert
function hidePannelFct () {
  console.log("click");
  if (k == 0) {
    closeHidePannelFct();
    return null;
  } if (k == 1) {
    openHidePannelFct();
    return null;
  }
};
function closeHidePannelFct() {
  $('#closeStorySpace_btn').transition({ y: '170px' });
  $('.storySpace').transition({ y: '170px' });
  // $( ".focusSpace" ).css( "padding-bottom", "20px" );
  $( ".focusSpace" ).animate({paddingBottom: "20px"}, "easin");
  k = 1;
};
function openHidePannelFct() {
  $('#closeStorySpace_btn').transition({ y: '0px' });
  $('.storySpace').transition({ y: '0px' });
  // $( ".focusSpace" ).css( "padding-bottom", "200px" )
  $( ".focusSpace" ).animate({paddingBottom: "200px"}, "easin");
  k = 0;
};


var k2 = 0;
function seeFullScreenImg () {
  var $img = $('.focusImg');
  if (k2 == 0) {
    hidePannelFct();

  var imageWidth = $img[0].width, //need the raw width due to a jquery bug that affects chrome
      imageHeight = $img[0].height, //need the raw height due to a jquery bug that affects chrome
      maxWidth = $(window).width(),
      maxHeight = $(window).height(),
      widthRatio = maxWidth / imageWidth,
      heightRatio = maxHeight / imageHeight;

  var ratio = widthRatio; //default to the width ratio until proven wrong

  if (widthRatio * imageHeight > maxHeight) {
      ratio = heightRatio;
  }

  //now resize the image relative to the ratio
  $img.attr('width', imageWidth * ratio)
      .attr('height', imageHeight * ratio);

  //and center the image vertically and horizontally
  $img.addClass('focusImg-fullscreened');

  closeHidePannelFct();
  k2 = 1;
  return null
} if (k2 == 1) {
  $img.removeClass('focusImg-fullscreened');
  openHidePannelFct();
  k2 = 0;
  return null;
}
};


  // var postData = 10; //Changé...
  // $( document ).ready(function() {
  //   recall();
  // });//ready
  //
  // $('#userPhoto').change(function() {
  //   console.log('lolilol');
  // });
  //
  // $('#addFriendsBtn').click(function(){
  //   var friend = $('#addFriends').val();
  //   friend = friend.toUpperCase();
  //   console.log(friend);
  //   $.post('/checkfriend', {friend:friend}, function(data){
  //     if (data == 'found') {
  //       console.log('ami trouvé');
  //     }
  //     if (data == 'nomatch') {
  //       console.log('non trouvé');
  //     }
  //     if (data == 'error') {
  //       console.log('error');
  //     }
  //   })
  // });
  //
  // $('#logoutButton').click(function(){
  //   $(location).attr('href', '/logout');
  //   console.log('click');
  // });
  //
  // $('#souvenirsLink').click(function(){
  //   $('.grid').empty();
  //   $('.grid').css("padding-top", "0px");
  //   recall();
  // });
  //
  // $('#amisLink').click(function(){
  //   $('.grid').empty();
  //   $('.grid').css("padding-top", "120px");
  //   friendsSectionDisplay();
  //   friendsRecall();
  // });
  //
  // $("#target").click(function() {
  //   $(location).attr('href', "/");
  // });
  //
  //
  // $("#userPhoto").change(function() {
  //   console.log('click');
  //   //Envoie file
  //   $('#fileUpForm').submit();
  // });
  //
  // function friendsSectionDisplay() {
  //   $(".grid").append('<div id="addFrDiv"><input id="addFriends" type="text" placeholder=" Ajouter un ami" name="addFriends" class="typeBox"/>'
  //     + '<button id="addFriendsBtn" type="button" class="btn btn-success">Add a Friend</button></div>');
  // }
  //
  // function friendsRecall() {
  //   $.ajax({
  //     type : "post",
  //     url  : "/friendsRecall",
  //     data : postData,
  //     success: function(responseData, textStatus, jqXHR) {
  //       console.log('success');
  //       console.log(responseData);
  //       var i;
  //       for (i in responseData) {
  //         displayFriends(responseData[i].prenom, responseData[i].nom, responseData[i].username, responseData[i].lastconnexion, responseData[i].userphotoid);
  //       }
  //     },
  //     error: function(jqXHR, textStatus, errorThrown) {
  //       console.log('error');
  //     }
  //   });
  // };
  //
  // function displayFriends(prenom, nom, pseudo, lastconnexion, userphotoid) {
  //   // var date = date.slice(0, -14); //enlève la fin de la date (GMT)
  //   $(".grid").append('<div class="row row-eq-height responsivefriends">'
  //     + '<div class="col-lg-4"><img src="/' + userphotoid + '" alt="Image pseudo"></div>'
  //     + '<div class="col-lg-8">'
  //     + prenom + " " + nom
  //     + '<p class="titre">' + pseudo + '</p>'
  //     + '</div>'
  //     + '</div>'
  //   );
  // };
  //
  //
  // function recall (){
  //   $.ajax({
  //       type: "post",
  //       url: "/recall",
  //       data: postData,
  //       //contentType: "application/x-www-form-urlencoded",
  //       success: function(responseData, textStatus, jqXHR) {
  //         console.log('____Recall ok');
  //         var i;
  //         for (i in responseData) {
  //           // console.log(responseData[i]);
  //         displayNewCard(responseData[i].idsvnr, responseData[i].titre,
  //               responseData[i].lieu, responseData[i].date1, responseData[i].idfile, responseData[i].hour);
  //         } //fin du for
  //         $('.responsive').click(function() {
  //           var idSvnrDB = $(this).children(".svnrNumberDisplay").text();
  //           $(location).attr('href', '/focus/' + idSvnrDB);
  //         });
  //       },
  //       error: function(jqXHR, textStatus, errorThrown) {
  //         alert('pb de recall' + textStatus + ", " + errorThrown, "red");
  //       }
  //     }); //ajax
  //     console.log('recall effectué');
  // }
  //
  // // Déclare la fonctionnalité d'ouverture de la carte en focus
  // function displayNewCard(idsvnr, titre, lieu, date, idFile, hour) {
  //   var date = date.slice(0, -14); //enlève la fin de la date (GMT)
  //   $(".grid").append('<div class="responsive" id="card">'
  //     + '<div class="svnrNumberDisplay">' + idsvnr + '</div>'
  //     + '<div class="img"><img id="img1" src="/' + idFile + '" alt="Votre image" width="300" height="200">'
  //     + '<div class="desc">'
  //     + '<p class="titre">' + titre + '</p>'
  //     // + '<p class="titreDesc">Lieu</p>'
  //     // + '<p class="titre" id="titre">' + lieu + '</p>'
  //     // + '<p class="titreDesc">Date</p>'
  //     // + '<p class="lieu" id="lieu">' + date + ' at ' + hour + '</p>'
  //     //+ '<button id="focusButton" type="button" class="btn btn-warning">Focus</button>'
  //     // + '</div>'
  //     + '</div></div>'
  //   );
  // };
  //
  // var h = 0;
  // $('.fa-bars').click(function () {
  //   switch (h) {
  //     case 0:
  //     $('#sidebar').transition({ x: '300px' });
  //     h=1;
  //       break;
  //     case 1:
  //     $('#sidebar').transition({ x: '0px' });
  //     h=0;
  //       break;
  //   }
  // });
