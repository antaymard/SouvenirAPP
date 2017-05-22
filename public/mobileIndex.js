var postData = 1, all_users_listNFO;
var dataS, dataA;
var o;
var recall = 0, limit = 10, svnrs;

$( document ).ready(function() {
  $('.modal').modal();

  //RECALL DES SOUVENRIS
  recallGlobal ();

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

function recallGlobal () {

$("#loadMoreCard").remove();

$.post("/svnr_recall", {limit:limit, recall:recall}, function (svnrs) {
  // console.log(svnrs);
  if(svnrs) {
    var n;
    for (n in svnrs) {
      var s = svnrs[n];
      displaySvnr(s.titre, s.file_address, s.description, s._id, s.createdBy[0].username, s.createdBy[0].photo_address, s.creation_date);
    }
    // displayFocusedSvnr(svnrs[0]._id);
    $('.tooltipped').tooltip({delay: 50});
    // hidePannelFct();

    $("#svnr_recall_space").append(
        '<div id="loadMoreCard" onclick="recallGlobal()" class="">'
        + ' <i class="medium material-icons">replay_10</i>'
      + '</div>'
    );

    // var imageWidth = 210;
    // $("#svnr_recall_space").width($(".myCard").length*imageWidth);
    //
  }
});
recall ++;
};


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



//------------------------------------------------------------------------------
  //Affichage du panel inférieur Story avec svnrs
  function displaySvnr(titre, img_address, description, idsvnr, cBusername, cBphotoAdress, creation_date) {
    $("#svnr_recall_space").append(
      '<div onclick="gotoFocusedSvnr('+ "'" + idsvnr + "'" +')" class="myCard">'
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

function gotoFocusedSvnr(id) {
  window.location.href = "/focus/"+ id;
}

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

// var k = 1; //1 = ouvert
// function hidePannelFct () {
//   console.log("click");
//   if (k == 0) {
//     closeHidePannelFct();
//     return null;
//   } if (k == 1) {
//     openHidePannelFct();
//     return null;
//   }
// };
// function closeHidePannelFct() {
//   $('#closeStorySpace_btn').transition({ y: '170px' });
//   $('.storySpace').transition({ y: '170px' });
//   // $( ".focusSpace" ).css( "padding-bottom", "20px" );
//   $( ".focusSpace" ).animate({paddingBottom: "20px"}, "easin");
//   k = 1;
// };
// function openHidePannelFct() {
//   $('#closeStorySpace_btn').transition({ y: '0px' });
//   $('.storySpace').transition({ y: '0px' });
//   // $( ".focusSpace" ).css( "padding-bottom", "200px" )
//   $( ".focusSpace" ).animate({paddingBottom: "200px"}, "easin");
//   k = 0;
// };
//

// var k2 = 0;
// function seeFullScreenImg () {
//   var $img = $('.focusImg');
//   if (k2 == 0) {
//     hidePannelFct();
//
//   var imageWidth = $img[0].width, //need the raw width due to a jquery bug that affects chrome
//       imageHeight = $img[0].height, //need the raw height due to a jquery bug that affects chrome
//       maxWidth = $(window).width(),
//       maxHeight = $(window).height(),
//       widthRatio = maxWidth / imageWidth,
//       heightRatio = maxHeight / imageHeight;
//
//   var ratio = widthRatio; //default to the width ratio until proven wrong
//
//   if (widthRatio * imageHeight > maxHeight) {
//       ratio = heightRatio;
//   }
//
//   //now resize the image relative to the ratio
//   $img.attr('width', imageWidth * ratio)
//       .attr('height', imageHeight * ratio);
//
//   //and center the image vertically and horizontally
//   $img.addClass('focusImg-fullscreened');
//
//   closeHidePannelFct();
//   k2 = 1;
//   return null
// } if (k2 == 1) {
//   $img.removeClass('focusImg-fullscreened');
//   openHidePannelFct();
//   k2 = 0;
//   return null;
// }
// };
