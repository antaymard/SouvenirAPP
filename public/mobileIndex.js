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

$("#searchInput").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        console.log('enter');
        var query_word = $('#searchInput').val();
        console.log(query_word);
        searchSvnr(query_word);
    }
});
$(document).on('keydown', '#searchInput', function(e) {
    if (e.keyCode == 32) return false;
});
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

function cancelSearch () {
  window.location.href = "/";
}



//------------------------------------------------------------------------------
  //Affichage des souvenirs
  function displaySvnr(titre, lieu, img_address, description, idsvnr, cBusername, cBphotoAdress, creation_date, nbShared, hashtags) {
    $("#svnr_recall_space").append(
        '<div onclick="gotoFocusedSvnr()" class="svnrCard">'
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
