var urlG = "http://82.239.100.156:8000";
// var urlG = "http://127.0.0.1:8000";     //+ io.connect !!!

$( document ).ready(function() {
  $('#addButton').transition({x:'+20px'});
  $('#plusButtDiv').transition({ rotate: '180deg' });
  //quand prêt, request 5 dernières lignes de DB par ajax.
var postData = 10; //Changé...
  $.ajax({
      type: "post",
      url: urlG + "/recall",
      data: postData,
      //contentType: "application/x-www-form-urlencoded",
      success: function(responseData, textStatus, jqXHR) {
        console.log('____Recall ok');;
        var i;
        for (i in responseData) {
          // console.log(responseData[i]);
        displayNewCard(responseData[i].idsvnr, responseData[i].titre,
              responseData[i].lieu, responseData[i].date1, responseData[i].idfile, responseData[i].hour);
        } //fin du for
        $('.responsive').click(function() {
          var idSvnrDB = $(this).children(".svnrNumberDisplay").text();
          $(location).attr('href', urlG + '/focus/' + idSvnrDB);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('pb de recall' + textStatus + ", " + errorThrown, "red");
      }
    }); //ajax

    //================SOCKET.IO==========
    var socket = io.connect('http://82.239.100.156:8080'); //A changer ici aussi !!!
    socket.emit('lol', {my : 'data'});
    socket.on('FileUploaded', function(state) {
      $('#addButton').css('color', 'white');
      $('#addButton').css('background-color', '#4CAF50');
      setTimeout(function() {
        $('#addButton').css('color', 'rgba(255, 255, 255, 0.7)');
        $('#addButton').css('background-color', 'transparent');
      }, 600);
    });

});//ready

//Déclare la fonctionnalité d'ouverture de la carte en focus
function displayNewCard(idsvnr, titre, lieu, date, idFile, hour) {
  var date = date.slice(0, -14); //enlève la fin de la date (GMT)
  $("#bodyGlobal").prepend('<div class="responsive" id="Card">'
    + '<div class="svnrNumberDisplay">' + idsvnr + '</div>'
    + '<div class="img"><img id="img1" src="' + urlG + '/' + idFile + '" alt="Votre image" width="300" height="200">'
    + '<div class="desc">'
    + '<p class="titreDesc">Titre</p>'
    + '<p class="titre">' + titre + '</p>'
    + '<p class="titreDesc">Lieu</p>'
    + '<p class="titre" id="titre">' + lieu + '</p>'
    + '<p class="titreDesc">Date</p>'
    + '<p class="lieu" id="lieu">' + date + ' at ' + hour + '</p>'
    //+ '<button id="focusButton" type="button" class="btn btn-warning">Focus</button>'
    + '</div></div></div>'
  );
};

$('#logoutButton').click(function(){
  $(location).attr('href', urlG + '/logout');
  console.log('click');
});

//================HEADER===============
//Reduce header au scroll
// $(window).scroll(function() {
//   if ($(document).scrollTop() > 30) {
//     $('#titreHeader, #searchBox').css('font-size', "15px");
//     $('#titreHeader, #searchBox').css('margin', "3px 0 2px 0");
//   } else {
//     $('#titreHeader, #searchBox').css('font-size', "22px");
//     $('#titreHeader, #searchBox').css('margin', "15px 0 7px 0");
//   }
// });
$("#titreHeader").click(function() {
  $(location).attr('href', urlG);
});

//================PIED===============
var n = 0;
$("#plusButtDiv").click(function() {
  switch(n) {
    case 0:
    buttDivOpen1();
    n = 1;
    break;
  case 1:
    buttDivClose();
    n = 0;
    break;
  }
});

function buttDivOpen1 () {
  $('#plusButtDiv').transition({ rotate: '0' });
  $('#buttDivFixed').transition({y:'-40px'});
  $('#addButton').transition({x:'-20px'});
  $('#validButtDiv').transition({ opacity: 1 });
};
function buttDivClose () {
  $('#buttDivFixed').transition({y:'0px'});
  $('#addButton').transition({x:'+20px'});
  $('#validButtDiv').transition({ opacity: 0 });
  $('#plusButtDiv').transition({ rotate: '180deg' });
};


//=========================FORM======================
// // //Soumission des datas du formulaire et retour du serveur
$("#validButtDiv").click(function() {
  /* stop form from submitting normally */
  // event.preventDefault();
  /* get the action attribute from the <form action=""> element */
});

$("#userPhoto").change(function() {
  console.log('click');
  //Envoie file
  $('#fileUpForm').submit();
});

$("#validButtDiv").click(function() {
  //Envoie texte
  var $form = $( "#resteUpForm" ), //image déjà envoyée par AJAX précédent ?
  url = $form.attr( 'action' );
  var postData = {
    titreSvnr:$('#titreSvnr').val(),
    lieuSvnr:$('#lieuSvnr').val(),
    typeSvnr:$('#typeSvnr').val(),
    date1:$('#date1').val(),
    hashtags:$('#hashtags').val(),
    date2:""
  };
  $.ajax({
    type: "post",
    url: url,
    data: postData,
    contentType: "application/x-www-form-urlencoded",
    success: function(responseData, textStatus, jqXHR) {
      console.log(responseData); //sous forme de JSON
    },
    error: function(jqXHR, textStatus, errorThrown) {
      statutDisplay(textStatus + ", " + errorThrown, "red");
    }
  })
  $(location).attr('href', urlG);
});

//=============================Geolocalisation===============


// $("#addButton").click(function() {
//   $(location).attr('href', urlG + '/new');
// });

//Focus = agrandissement de la barre de recherche + enter to submit
// $("#searchBox").focusin(function() {
//   $(this).css('width', "auto");
//   $(this).css('margin', "15px 0 0 -150px");
// });
// $("#searchBox").focusout(function() {
//   $(this).css('width', "30px");
//   $(this).css('margin', "15px 0 0 0");
// });
// $('#searchBox').keypress(function (e) {
//   if (e.which == 13) {
//     // var searchData = $('input#searchBox').val();
//     $('#searchForm').submit();
//     // alert(searchData + ' / ' + typeof searchData);
//     // $.ajax({
//       //   type: "post",
//       //   url: "http://127.0.0.1:8000/searchbytag",
//       //   //contentType: "text/plain",
//       //   data: "data is" + searchData,
//       //   success: function(responseData, textStatus, jqXHR) {
//       //     $('bodyGlobal').remove(); //supprime les cartes affichées par index
//       //     //Affiche les nouvelles cartes form DB
//       //     displayNewCard(responseData[i].idsvnrdb, responseData[i].titre,
//       //           responseData[i].lieu, responseData[i].date1, responseData[i].idfile);
//       //     //Déclare la fonctionnalité d'ouverture de la carte en focus
//       //     $('#Card').click(function() {
//       //       var idSvnrDB = $(this).children(".svnrNumberDisplay").text();
//       //       $(location).attr('href', 'http://127.0.0.1:8000/focus/' + idSvnrDB);
//       //     });
//       //   },
//       //   error: function(jqXHR, textStatus, errorThrown) {
//       //     alert("2" + textStatus + ", " + errorThrown);
//       //     //alert(searchData); //fonctionne
//       //   }
//       // })
//     return false;    //<---- Add this line = annule l'action classique de enter
//   }
// });


// var cardSvnr = {
//   iduser:"",
//   idsvnrdb:"",
//   titre: "",
//   lieu: "",
//   idfile:"",
//   creationdate:"",
//   type:"",
//   date1:"",
//   hour:"",
//   date2:"",
//   comments:"",
//   hashtags:"",
//   presentfriends:"",
//   sharedfriends:"",
//   linkedtoid:"",
//   update(idsvnrdb, titre, lieu, idfile) { //COMPLETER
//     cardSvnr.idsvnrdb = idsvnrdb;
//     cardSvnr.titre = titre;
//     cardSvnr.lieu = lieu;
//     cardSvnr.idfile = idfile;
//     $("#bodyGlobal").prepend("<br>" + cardSvnr.titre)
//   },
//   display(){
//     $("#bodyGlobal").prepend('<div class="responsive" id="Card">'
//     + '<div class="svnrNumberDisplay">#' + cardSvnr.idsvnrdb + '</div>'
//     + '<div class="img"><img id="img1" src="http://127.0.0.1:8000/' + idFile + '" alt="Votre image" width="300" height="200">'
//     + '<div class="desc">'
//     + '<p class="titreDesc">titre</p>'
//     + '<p class="titre">' + cardSvnr.titre + '</p>'
//     + '<p class="titreDesc">lieu du souvenir</p>'
//     + '<p class="titre" id="titre">' + cardSvnr.lieu + '</p>'
//     + '<p class="titreDesc">idfile</p>'
//     + '<p class="lieu" id="lieu">' + cardSvnr.idfile + '</p>'
//     + '</div>'
//     + '</div>');
// }
// };
//
//   //Fct de suppression de la card
//   if (supprState == 'true') {
//   $("#editButton").click(function() {
//     $(this).closest("#Card").remove();
//   });
//   }
// }


//
//
// //Fonction de voyant vert pour succès
// function statutDisplay(state, color) {
//   if (color == "green") {
//     $('#statutDisplay').addClass('alert-success');
//   }
//   else {
//     $('#statutDisplay').addClass('alert-danger');
//   }
//   $('#statutDisplay').fadeToggle();
//   $('#dbRecStatut').html(state);
// //efface les span
//   setTimeout(function(){
//     $('#dbRecStatut').html("");
//     $('#connServStatut').html("");
//   //efface le fond
//     $('#statutDisplay').fadeToggle();
//     }, 1300)
// };
//
// //Code OK à partir de là
// //Afficher le panel
//
//
// //Bouton de validation
// $("#validationButton").click(function() {
//   //Cacher les panels
//   $("#addPanel, #addPanelBlack").fadeToggle(300);
//   //Prendre les valeurs et les mettre --> Annulé
//   //Incrémenter numéro du souvenir
//   svnrNumber ++;
//   console.log("nombre de souvenirs : " + svnrNumber)
//
//   //Créer une card
//   //displayNewCard ();
//
//   //Draggable les card responsive
//   //$( ".responsive" ).draggable({ containment: "#bodyGlobal" });
//   //Fonctionnaliser les boutons de suppr
//   InitSupprButtonFct()
// });
