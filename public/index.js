$( document).ready(function() {
  $('.modal').modal();

  //RECALL DES SOUVENRIS
  var recall = 1, svnrs;
  $.post("/svnr_recall", {recall:recall}, function (svnrs) {
    console.log(svnrs);
    if(svnrs) {
      var n;
      for (n in svnrs) {
        displaySvnr(svnrs[n].titre, svnrs[n].file_address, svnrs[n].description);
      }
      console.log(svnrs);
    }
  });

  //CHARGER LES NOMS DES USERS POUR L'AUTOCOMPLETE DE LA RECHERCHE
  var postData = 1, all_users_listNFO;
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
        $('input.autocomplete').autocomplete({
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
        "<div class='z-depth-1 card blue-grey hoverable' id='modal_card_response'>"
        + "<div class='card-content white-text'>"
        +   "<img id='profilePic_modal' class='circle responsive-img' src='" + data[0].photo_address + "'>"
        +   "<div id='panel_text'>"
        +      "<p id='modal_pseudo'>" + data[0].username + "</p>"
        +      "<p id='modal_prenom'>" + data[0].prenom + " " + data[0].nom + "</p>"
        +      "<p class='modal_desc'>" + user_age + " ans, de " + data[0].living_city + "</p>"
        +     "</div>"
        +   "</div>"
        +   "<div class='modal-footer blue-grey'>"
        +     "<button id='add_as_friend_btn' style='float : right; margin-right : 30px' class='modal-action white-text waves-effect waves-green btn-flat'>Ajouter</button>"
        +   "</div>"
        + "</div>"
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

function displaySvnr(titre, img_address, description) {
  $("#svnr_recall_space").append(
     '<div class="col m4">'
    +  '<div class="card sticky-action card_svnr hoverable">'
    +    '<div class="card-image waves-effect waves-block waves-light card_img">'
    +      '<img class="activator" style="object-fit:cover; height:100%" src="'+ img_address + '">'
    +    '</div>'
    +    '<div class="card-content">'
    +      '<span class="card-title activator grey-text text-darken-4" style="font-size:17px;">'+ titre
    // +'<i class="material-icons right">more_vert</i>'
    + '</span>'
    // +      '<p><a href="#">This is a link</a></p>'
    +    '</div>'
    +    '<div class="card-action"><a href="#">SHARE</a>'
    +  '<a href="#">EXPLORE</a></div>'
    +    '<div class="card-reveal">'
    +      '<span class="card-title grey-text text-darken-4">'+ titre +'<i class="material-icons right">close</i></span>'
    +      '<p>'+ description +'</p>'
    +    '</div>'
    +  '</div>'
    +'</div>'
  );
};

  function calcAge(dateString) {
  var birthday = +new Date(dateString);
  return ~~((Date.now() - birthday) / (31557600000));
};

$("#input_photo").change(function() {
  console.log('click');
  //Envoie file
  $('#fileUp').submit();
});









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
