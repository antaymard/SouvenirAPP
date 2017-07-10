$(document).ready(function(){

  //Affiche le nombre de souvenirs que j'ai créé
  $.post("/getSvnrNumber", {ping:"ping"}, function (number) {
    if (number) {
      $("#profileInfoDiv").append(
        '<img class="togetherLogo" src="favicon-32x32.png">'
        + '<span> '+ number +' souvenirs </span>')
    }
  });

  //Affiche mes amis
  $.post("/getAllMyFriends",{send : "1"},function(myFriends_data){
      if(myFriends_data) {
        console.log(myFriends_data);
        var i;
        for (i in myFriends_data) {
          if (!myFriends_data[i].photo_address) {myFriends_data[i].photo_address = "http://placehold.it/350x150"}
          var user_age = calcAge(myFriends_data[i].birthday);
          $('#content_Space').append(
            '<div class="friendCard">'
          +     '<div class="card-image">'
          +       '<img class="imgFriend" src="' + myFriends_data[i].photo_address +'">'
          +     '</div>'
          +     '<div class="cardContent">'
          +        '<p>'+ myFriends_data[i].username + " - "+ myFriends_data[i].prenom + ' ' + myFriends_data[i].nom + '</p>'
          +        '<p>'+ user_age + " ans" + '</p>'
          +        '<div class="cardAction">'
          +        '<img class="togetherLogo" src="favicon-32x32.png"><span> 24</span>'
          // +           '<a href="#" class="exploreBtn">EXPLORER</a>'
          +        '</div>'
          +      '</div>'
          +  '</div>'
          );
        };
      }
    });

});

var divOpened = false;
//Ouvre le popup d'ajout d'ami
$("#addFriendBtn").click(function() {
  switch (divOpened) {
    case false :
      $('#popUp').transition({ y: '-500px' });
      $('#addFriendBtn').transition({ rotate: '45deg' });
      $('#addFriendBtn').css("color", "red");
      divOpened = true;
      break;
    case true :
      $('#popUp').transition({ y: '0px' });
      $('#addFriendBtn').transition({ rotate: '0deg' });
      $('#addFriendBtn').css("color", "white");
      divOpened = false;
      break;
}
});

$("#addFriendInputBtn").click(function() {
  $("#popUp_body").empty();
  var search = $("#addFriendInput").val();
  $.post("/get_user_card_addFr",{search : search},function(result){
    if (result) {
      var i;
      for (i in result) {
        var user_age = calcAge(result[i].birthday);
        $('#popUp_body').append(
          '<div class="friendCard">'
        +     '<div class="card-image">'
        +       '<img class="imgFriend" src="' + result[i].photo_address +'">'
        +     '</div>'
        +     '<div class="cardContent">'
        +        '<p>'+ result[i].username + " - "+ result[i].prenom + ' ' + result[i].nom + '</p>'
        +        '<p>'+ user_age + " ans" + '</p>'
        +        '<div class="cardAction">'
        +        '<img class="togetherLogo" src="favicon-32x32.png"><span> 24</span>'
        +           '<button onclick="addAsFriend('+ "'" + result[i]._id + "'" + ')" class="exploreBtn">AJOUTER</button>'
        +        '</div>'
        +      '</div>'
        +  '</div>'
        );
      };
    }
  });
});

function addAsFriend(idF) {
  $.post("/add_as_friend",{friendid : idF},function(response){
    if (response == "added") {
      $("#popUp_body").empty();
      $('#popUp_body').append("Une demande a été envoyée à votre ami(e). Il apparaîtra dans vos amis quand il vous aura également ajouté");
    }
    if (response == "autoajout") {
      $("#popUp_body").empty();
      $('#popUp_body').append("Vous êtes déjà votre meilleur ami :)");
    }
    if (response == "déjà amis") {
      $("#popUp_body").empty();
      $('#popUp_body').append("Vous êtes déjà amis ! Si l'ami n'aparaît pas dans votre liste, c'est qu'il ne vous a pas ajouté !");
    }
  })
}

$("#input_photo").change(function() {
  console.log('click');
  //Envoie file
  $('#fileUp').submit();
});


function calcAge(dateString) {
var birthday = +new Date(dateString);
return ~~((Date.now() - birthday) / (31557600000));
};


// reactForm('#titre', 'titre', 'text');
//
//
//
// function reactForm(id, txt, type) {
// $(id).click(function(){
//   console.log('click on ' + id);
//     var name = $(this).text();
//     $(this).html('');
//     $('<input></input>')
//         .attr({
//             'type': type,
//             'name': 'fname',
//             'id': 'txt_' + txt,
//             'size': '30',
//             'value': name
//         })
//         .appendTo(id);
//     $('#txt_' + txt).focus();
// });
