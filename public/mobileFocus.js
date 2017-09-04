
$("#svnrDate").append(_date);
console.log(niceDate(_date));


function niceDate(input) {
  var date_jour = input.substring(8, 10);
  var date_mois = returnMonth(Number(input.substring(5, 7)));
  var date_an = input.substring(0, 4);

  function returnMonth (month_numb) {
    var ans;
    switch (month_numb) {
      case 1:
      return "JAN";
      break;
      case 2:
      return "FEV";
      break;
      case 3:
      return "MAR";
      break;
      case 4:
      return "AVR";
      break;
      case 5:
      return "MAI";
      break;
      case 6:
      return "JUIN";
      break;
      case 7:
      return "JUIL";
      break;
      case 8:
      return "AOUT";
      break;
      case 9:
      return "SEPT";
      break;
      case 10:
      return "OCT";
      break;
      case 11:
      return "NOV";
      break;
      case 12:
      return "DEC";
      break;
    }

    return date_jour + " " + date_mois + " " + date_an;
  };
}

function openSharedFriendPanel(idSvnr) {
  clearPopup();
  editTitrePopup("PARTAGER AVEC UN AMI");

  $.post("/friends_recall",{send : "1"},function(myFriends_data){
    if(myFriends_data) {
      var i;
      for (i in myFriends_data) {
        if (!myFriends_data[i].photo_address) {myFriends_data[i].photo_address = "http://placehold.it/350x150"}
        $('#variablepopup').append(
          '<div onclick="addAsShared('+ "'" + idSvnr +"'" + ','+"'"+ myFriends_data[i]._id +"'"+')" class="friendCard">'
        +    '<img class="friendImg" src="' + myFriends_data[i].photo_address + '">'
        +    myFriends_data[i].username
        +  '</div>'
        );
      };
    }
  });

  $('#popupDiv').transition({ y: '-300px' });
  //Ouvre un popup (= fonction)
  //Charge en AJAX la liste d'amis (server dejà fait) avec onclick = add idSvnr et userid
};

// A MODIFIER
function displaySharedFriends(idSvnr) {
  $.post("/add_as_shared", {idSvnr:idSvnr}, function(data){
    if (data == 'added') {
      console.log("added");
    }
});
}

function addAsShared(idSvnr, idFriend) {
  $.post("/add_as_shared", {sharedF:idFriend, idSvnr:idSvnr}, function(data){
    if (data == 'added') {
      console.log("added");
    }
});
};

function clearPopup(){
  $('#titrepopup').empty();
  $('#variablepopup').empty();
}

function editTitrePopup(titre) {
  $('#titrepopup').append(
    titre
  );
  $('#titrepopup').click(function(){
    closePopUp()
  })
};

function closePopUp() {
  clearPopup();
  $('#popupDiv').transition({ y: '0px' });
};

  // var urlG = "http://82.239.100.156:8000";
  //
  // $("#titreHeader").click(function() {
  //   $(location).attr('href', '/');
  // });
  //
  // //parse le string hashtags en mots séparés suivant ',_' + change en lien
  // $( document ).ready(function() {
  //     var hashtags = $("#hashtagsSpan").text();
  //     hashtags = hashtags.split(', ');
  //     $('#hashtagsSpan').remove();
  //
  //     for (i in hashtags) {
  //       $('#hashtagsPlace').append('<span class="badge" id="hashtagsSpan">#' + hashtags[i] + '</span>');
  //     }
  // });
  //
  // console.log($('#supprButton').text());
  //
  // $('#supprButton').click(function(){
  //   $.get(window.location.pathname + "/delete", function(data){
  //     if(data==='done');
  //     $(location).attr('href', "/");
  //   });
  // })
  //
  // reactForm('#titre', 'titre', 'text');
  // reactForm('#lieu', 'lieu', 'text');
  // reactForm('#presentfriends', 'presentfriends', 'text');
  // reactForm('#sharedfriends', 'sharedfriends', 'text');
  // reactForm('#comments', 'comments', 'text');
  // reactForm('#date', 'date', 'date');
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
  //
  // $(document).on('blur','#txt_' + txt, function(){
  //     var name = $(this).val();
  //     //alert('Make an AJAX call and pass this parameter >> name=' + name);
  //     $(id).text(name);
  //
  //     var lieu = $('#lieu').text();
  //       if (!lieu) {
  //         refillEmpty('#lieu');
  //       }
  //     var titre = $('#titre').text();
  //     if (!titre) {
  //       refillEmpty('#titre');
  //     }
  //     var presentfriends = $('#presentfriends').text();
  //     if (!presentfriends) {
  //       refillEmpty('#presentfriends');
  //     }
  //     var sharedfriends = $('#sharedfriends').text();
  //     if (!sharedfriends) {
  //       refillEmpty('#sharedfriends');
  //     }
  //     var linkedtoid = $('#linkedtoid').text();
  //     if (!linkedtoid) {
  //       refillEmpty('#linkedtoid');
  //     }
  //     var date = $('#date').text();
  //     if (!date) {
  //       $("#date").text('1900-01-01');
  //     }
  //     var comments = $('#comments').text();
  //     com = comments.split("'");
  //     console.log(com.length);
  //     if (com.length > 1) {
  //       var n;
  //       comments = "";
  //       for (n in com) {
  //         comments += com[n] + "''";
  //       }
  //       comments = comments.toString().slice(0, -2);
  //     }
  //     console.log(comments);
  //     if (!comments) {
  //       refillEmpty("#comments");
  //     }
  //
  //     $.post(window.location.pathname + "/update", {lieu:lieu, titre:titre,
  //       presentfriends:presentfriends, sharedfriends:sharedfriends,
  //       linkedtoid:linkedtoid, date1:date, comments:comments}, function(data){
  //       if(data==='synced'){
  //         console.log('synchronisé');
  //         alerte("#8BC34A");
  //       }
  //       if (data==='err') {
  //         console.log('error synch');
  //         alerte("red");
  //       }
  //     });
  // });
  // }
  //
  // function alerte(state) {
  //   $('#header').css('border-bottom', '3px solid ' + state);
  //
  //   setTimeout(function(){
  //     $('#header').css('border-bottom', '3px solid #199894');
  //   }, 1000);
  // }
  //
  //
  // function refillEmpty(id) {
  //   $(id).html('<i>Non renseigné</i>');
  // }
