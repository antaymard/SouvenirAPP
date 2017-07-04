var recall = 0, limit = 10, svnrs;
var query_type;

//OBSCURCIR HEADER QUAND SCROLLED
$(window).on("scroll touchmove", function () {
    $('#myHeader').toggleClass('noTransparentHeader', $(document).scrollTop() > 50);
});

// NOTE: ANIMATION DU PANNEAU SOUS RECHERCHE. LA BARRE EST ANIMéE EN CSS
$('#searchInput').on({
  focus: function () {
    $('.svnrCard').transition({ y: '10px' });
    $( ".svnrCard" ).animate( {
      opacity: 0.6,
    },
    {
      duration : 500,
      queue: false
    });
    $( "#searchInputDiv" ).animate( {
      opacity: 1,
    },
    {
      duration : 200,
      queue: false
    });
  },
  blur: function () {
    $( ".svnrCard" ).animate( {
      opacity: 1,
    },
    {
      duration : 500,
      queue: false
    });
    $( "#searchInputDiv" ).animate( {
      opacity: 0.6,
    },
    {
      duration : 200,
      queue: false
    });
      $('.svnrCard').transition({ y: '0' });
  }
});

$( document ).ready(function() {

  //RECALL DES SOUVENRIS
  recallGlobal ();

  //auto load more souvenris
  $(window).scroll(function() {
     if($(window).scrollTop() + $(window).height() == $(document).height()) {
        //  recallGlobal();
     }
  });

// NOTE: WORK IN PROGRESS defocus la barre quand on scroll vers le bas
  if ($(document).scrollTop() > 50) {
    $("#searchInput").blur();
  }
});

function recallGlobal () {
  $("#loadMoreCard").remove();
  $.post("/svnr_recall", {limit:limit, recall:recall}, function (svnrs) {
    // console.log(svnrs);
    if(svnrs) {
      var n;
      for (n in svnrs) {
        var s = svnrs[n];
        displaySvnr(s.titre, s.lieu, s.file_address, s.description, s._id, s.createdBy[0].username, s.createdBy[0].photo_address, s.creation_date, s.sharedFriends.length, s.hastags);
      }
      $("#svnr_recall_space").append(
          '<div id="loadMoreCard" onclick="recallGlobal()" class="">'
          + ' <i class="medium material-icons">replay_10</i>'
        + '</div>'
      );
    }
  });
  recall ++;
};

//USER PRESS ENTRER APRES AVOIR SAISI LES MOTS DE RECHERCHE
$("#searchInput").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        console.log('enter');
        var query_word = $('#searchInput').val();
        console.log(query_word);
        searchSvnr(query_word);
    }
});

//EMPECHER LA TOUCHE ESPACE DANS LE INPUT RECHERCHE
$(document).on('keydown', '#searchInput', function(e) {
    if (e.keyCode == 32) return false;
});

//FONCTION AJAX DE RECHERCHE de souvenir
function searchSvnr (query_word) {
  $.post("/searchSvnr", {query_word:query_word}, function (resultSvnrs) {
    if(resultSvnrs) {
      console.log(resultSvnrs);
      $('#svnr_recall_space').empty();
      $("#svnr_recall_space").append(
        '<p style="color:white">'+ resultSvnrs.length + ' Souvenirs trouvé(s) avec "'+ query_word + '" dans le titre<span id="searchCancel"><button onclick="cancelSearch()">Annuler</button></span></p>'
      );
      var n;
      for (n in resultSvnrs) {
        var s = resultSvnrs[n];
        displaySvnr(s.titre, s.lieu, s.file_address, s.description, s._id, s.createdBy[0].username, s.createdBy[0].photo_address, s.creation_date, s.sharedFriends.length, s.hastags);
      }
    } else {
      console.log("no results");
    }
  });
}

//QUAND APPUIE SUR CANCEL DE RECHERCHE === A passer en dynamique
function cancelSearch () {
  window.location.href = "/mobileIndex";
}



//------------------------------------------------------------------------------
  //Affichage des souvenirs
  function displaySvnr(titre, lieu, img_address, description, idsvnr, cBusername, cBphotoAdress, creation_date, nbShared, hashtags) {
    $("#svnr_recall_space").append(
        '<div onclick="displayFocusedSvnr('+ "'" + idsvnr + "'" + ')" class="svnrCard">'
      + '<div class="svnrCard_topDiv">'
        + '<img class="who_posted" src="/'+ cBphotoAdress + '">'
        + '<div class="svnrCard_topDiv_rightPart">'
          + '<div class="cBusername">' + cBusername
            + '<span class="actionType">a ajouté une anécdote</span>'
          + '</div>'
          + '<div class="creationDate">'+ calcAgo(creation_date) +'</div>'
        + '</div>'
      + '</div>'
        + '<img class="svnrImg" src="/'+ img_address +'">'
        + '<div class="svnrCard_botDiv">'
          + '<div class="titreDiv">'+ titre +'</div>'
          + '<div class="dateDiv">date</div>'
          + '<div class="lieuDiv">'+ lieu +'</div>'
        + '</div>'
      + '</div>'
    );
  };


$("#input_photo").change(function() {
  console.log('click');
  //Envoie file
  $('#fileUp').submit();
});


//=============================== AFFICHE UN FOCUS SOUVENIR ====================

function displayFocusedSvnr(focusId) {
  $('#svnr_recall_space').empty();

  //Enlever le + button
  $('#input_photo').transition({ y: '95px' });

  //Enlever le HEADER
  $('#myHeader').transition({ y: '-65px' });

  //Enlever la  barre de recherche
  $( "#searchInput" ).transition({y: '-150px'});

  //Crée le nouveau header
  $("#svnr_recall_space").append(
     '<div id="myFHeader" class="FtransparentHeader">'
    +  '<button class="headerButton" onclick="closeFocus()">'
    +     '<i class="material-icons backIcon">keyboard_arrow_left</i>'
    +   '</button>'
    +'</div>'
  );

  //Récupère les infos du souvenir focused
  $.post("/focusedRecall", {focusId : focusId}, function (resultFocus) {
    if(resultFocus) {

      //Affiche photo, description etc et le layout vide pour amis
      displayFocusedSvnrLayout (resultFocus[0]);

      // getPresentFriends(resultFocus[0]._id);

      //Affiche les amis avec lesquels le svnr est partagé
      getSharedFriends(resultFocus[0]._id);

      //Affiche les comments du souvenir
      getAnecdotes (resultFocus[0]._id);
  };
});
} //Fin displayFocusedSvnr

function displayFocusedSvnrLayout (f) {
  $("#svnr_recall_space").append(
     '<div id="creatorDiv">'
    +  '<img class="creatorDivPicture" src="/'+ f.createdBy[0].photo_address + '" alt="photo de profil">'
    +  '<div id="creatorDivInfo">'
    +    '<p id="svnrTitre">' + f.titre + '</p>'
    +    '<p id="svnrDate">'+ f.creation_date +'</p>'
    +  '</div>'
    + '</div>'

    + '<img class="svnrImg" src="/' + f.file_address + '">'

    +'<p class="chapterP">Avec</p>'

    +'<div id="avecDiv">'
    +    '<div id="presentFriendsDiv">'
    +      'ici photos des present friends'
    +    '</div>'
    +  '</div>'

    + '<div id="descriptionDiv">'
    +    '<div id="descDivTxt">'
    +      '<p style="font-size: 13px; font-weight:800">Description</p>'
    +      '<p>'+ f.description +'</p>'
    +    '</div>'
    +    '<div id="sharedDiv">'
    +      '<p class="chapterP" style="color:black; margin:0 2px 0 2px">Partagé avec</p>'
    +       '<div id="sharedDivDiv">'
    +       '</div>'
    +    '</div>'
    +  '</div>'

    + '<p class="chapterP">Anecdotes</p>'

    + '<div id="anecdoteDiv">'

    // +    '<div class="anecdoteDivTxt">'
    // +      '<div class="anecdoteDivTxtLeft">'
    // +        '<img src="/'+ f.createdBy[0].photo_address +'" class="creatorDivPicture anecdotePic">'
    // +      '</div>'
    // +      '<div class="anecdoteDivTxtRight">'
    // + 'Aximus est reptaque por ad moluptatum dolestiberum qui- busam et aut aped magnam aut omnimil laboreicabo. Disi- mi, quas eatus et et unt re non porior siti ut a sin et et aut l'
    // +   '</div>'
    // +   '</div>'
    //
    // +    '<div class="anecdoteDivTxt">'
    // +      '<div class="anecdoteDivTxtLeft">'
    // +        '<img src="/'+ f.createdBy[0].photo_address +'" class="creatorDivPicture anecdotePic">'
    // +      '</div>'
    // +      '<div class="anecdoteDivTxtRight">'
    // + 'i dolutes cullam, comnim aceaquias et molorem rehendae voluptate natum fugitae nonet fuga. Vitaers pidunt oditior emolu- picia aut in nullaboribus autatem int, sunt eate nonsequam, tet quia- ti beat eum qui doluptae. Nus, quam res il il ma int omnisquatur? Agnis aceprorionet earunto elictae peliatquam, ulparum laccum utenis excesto maximet uriscius dite late sus des et ducidis aliquiam fugit mo- lore evelibe rspedi od ma aspicipsus adias quibusam explatet erio beritat. Archill acculpa sum etur aut evel ipiet hiciaep '
    // +   '</div>'
    // +   '</div>'

    +  '</div>'

    + '<div id="anecdoteInputDiv" class="anecdoteDivTxt">'
    +   '<div class="anecdoteDivTxtLeft">'
    // BUG: CHANGER LA PHOTO
    +     '<img src="'+ $('#myProfilePic').attr('src') +'" class="creatorDivPicture anecdotePic">'
    +   '</div>'
    +   '<div class="anecdoteDivTxtRight" style="display:flex; flex-direction:row">'
    +     '<textarea id="anecdoteInput" cols="50" rows="5" placeholder="Ajouter une anecdote...">'
    +     '</textarea>'
    +     '<button onclick="submitAnecdote('+ "'" + f._id + "'" +')" class="gradButton" id="submitAnecdoteBtn">'
    +        '<i class="material-icons">send</i>'
    +     '</button>'
    +   '</div>'
    + '</div>'

  );
};

function getPresentFriends (p) {
  $.post("/getPresentFriends", {idSvnr : p}, function (result) {
    if(result) {
      console.log(result);
      //APPEND DANS L'ESPACE CORRESPONDANT
  };
});
};

function getSharedFriends (sh) {
  $("#sharedDivDiv").empty();

  $.post("/getSharedFriends", {idSvnr : sh}, function (result) {
    if(result) {
      var n;
      for (n in result[0].sharedFriends) {
        $("#sharedDivDiv").append(
          '<img src="/'+ result[0].sharedFriends[n].photo_address +'" class="creatorDivPicture"/>'
        )
      };
      //Affiche le bouton pour ajouter un sharedFriends
      $("#sharedDivDiv").append(
        '<button onclick="displayAllMyFriends('+ "'" + sh + "'" + ')" class="gradButton addFriendBtn">+</button>'
      )
    };
  });
};//fin getSharedFriends

function getAnecdotes (an) {
  $("#anecdoteDiv").empty();

  $.post("/getComments", {idSvnr : an}, function (result) {
    if (result) {
      console.log(result);
      var n;
      for (n in result) {
        $("#anecdoteDiv").append(
              '<div class="anecdoteDivTxt">'
          +      '<div class="anecdoteDivTxtLeft">'
          +        '<img src="/'+ result[n].createdBy[0].photo_address +'" class="creatorDivPicture anecdotePic">'
          +      '</div>'
          +      '<div class="anecdoteDivTxtRight">'
          +         result[n].content
          +     '</div>'
          +   '</div>'
        )
      };
    }
  })
}

//Affiche le pop up quand le + est cliqué = affiche mes amis => peut ajouter en sharedFriends
function displayAllMyFriends (idSouv) {

  //Affiche le popup
  $("#svnr_recall_space").append(
    '<div onclick="closeAddFriendDiv()" id="popupDivBckGround">'
    + '<p>Partager avec un ami</p>'
    +   '<div id="popupDiv">'
    +   '</div>'
    +'</div>'
  );

  //Insère les cartes d'amis dans le popup
  $.post("/getAllMyFriends", {lol : 1}, function (response) {
    if(response) {
      console.log(response);
      var n;
      for (n in response) {
        $("#popupDiv").append(
            '<div onclick="addAsShared('+ "'" + response[n]._id + "', '" + idSouv + "'" + ')" class="friendCard">'
          +    '<img class="creatorDivPicture" src="/'+ response[n].photo_address +'">'
          +   '<p>'+ response[n].username + '</p'
          + '</div>'
        )
      }
    }
  });
};

//Ajouter l'ami cliqué comme partagé avec
function addAsShared (idFriend, idSouv) {
  console.log(idFriend + " " + idSouv);
  $.post("/addSharedFriend", {idFriend : idFriend, idSouv : idSouv}, function (state) {
    if(state == 'added') {
      console.log("added");
      getSharedFriends(idSouv);
    }
    if (state == 'already_shared') {
      console.log("dejà partagé");
    }
  });
};

//Fermer le popup d'ajout d'ami (share)
function closeAddFriendDiv () {
  $("#popupDivBckGround").remove();
};

//Revenir en arrière (au display global) quand le retour est cliqué
function closeFocus() {
  //Remettre le + button
  $('#input_photo').transition({ y: '0px' });

  //Supprimer le focus svnr
  $('#svnr_recall_space').empty();

  //Remettre le HEADER
  $('#myHeader').transition({ y: '0px' });

  //Remettre la  barre de recherche
  $( "#searchInput" ).transition({y: '0px'});

  //RECALL DES SOUVENRIS
  recall --;
  recallGlobal ();
}

//Envoie l'anecdote
function submitAnecdote(idSouv) {
  var content = $("#anecdoteInput").val();
  var date = new Date();
  console.log(content + " " + date);

  if (content) {
    $.post("/addComment", {idSouv : idSouv, content:content, date:date}, function (result) {
      if(result) {
        console.log(result);
        if (result == 'done') {

          //Refresh le module
          getAnecdotes (idSouv);
          //Vide le textarea
          $("#anecdoteInput").val('');
          content = null;

        } else {
          console.log("erreur d'ajout d'anecdote");
        }
      };
    });
  }
};

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


  //FONCTION POUR PARTAGE AVEC AMI
  // function sharedFriendsSupp(idFriend) {
  //   console.log(dataA);
  //   $.post("/sharedFriends_Supp",{idFriend:idFriend, idSvnr:dataA},function(data6){
  //     if(data6) {
  //       //supprimer la bulle côté client
  //       console.log(data6);
  //
  //       displayFocusedSvnr(dataA);
  //
  //     }
  //   })
  // };


    //CHARGER LES NOMS DES USERS POUR L'AUTOCOMPLETE DE LA RECHERCHE
    // $.ajax({
    //   type : "post",
    //   url  : "/get_all_users_names",
    //   data : postData,
    //   success: function(all_users_listNFO, textStatus, jqXHR) {
    //     var auto = "{"
    //     var i;
    //     for (i in all_users_listNFO) {
    //       auto += '"' + all_users_listNFO[i].username + '" : "' + all_users_listNFO[i].photo_address + '",'
    //     };
    //     auto = auto.slice(0, -1);
    //     auto += "}"
    //     auto = jQuery.parseJSON(auto)
    //     $('#input_addFriends').autocomplete({
    //       data: auto,
    //       limit: 20,
    //     });
    //   },
    //   error: function(jqXHR, textStatus, errorThrown) {
    //     console.log('error');
    //   }
    // });
