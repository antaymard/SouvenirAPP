var souvenirObject = {};


// NOTE: AMAZON S3 BOILER PLATE ================================================

var albumBucketName = 'rememberbucket';
var bucketRegion = 'eu-west-1';
var IdentityPoolId = 'eu-west-1:52646bbd-0f01-45e3-ad27-e58bc5e4b7f3';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

//upload.abort.bind(upload) //pour annuler et stopper l'upload.

// fonction d'ajout de photo ----------------------------
var progression, fileLength;
function addPhoto(albumName) {

  progression = 1;

  // clean souvenirObject.fileNames
  souvenirObject.file_addresses = [];

  var files = document.getElementById('photoupload').files;

  if (!files.length) {
    return alert('Please choose a file to upload first.');
  } else
  if (files.length > 3) {
    return alert('Please choose maximum 3 files.')
  } else

  if (files.length <= 3) {
    fileLength = files.length;

    //Change indicator sous la progress bar et assombrit le texte
    $( "#progressIndicator" ).text(files.length + " image(s) en cours de transfert.");
    $( "#progressIndicator" ).css('color', 'rgba(0,0,0,0.7)');

    //Loading spinner initiated in submitbtn
    $('#submitBtnIcon').text('loop');
    $('#submitBtnIcon').addClass('spinning');
    $('.submitBtn').css('background-color', 'rgba(0,0,0,0)');
    $('.submitBtn').prop("disabled", true);

    for (var j = 0; j < files.length; j++) {
      var file = files[j];

      var fileName = makeRandomId(file.name);
      if (file.type == 'image/png') {
        fileName += '.png'
      } else
      if (file.type == 'image/jpg') {
        fileName += '.jpg'
      } else
      if (file.type == 'image/jpeg') {
        fileName += '.jpeg'
      }

      var albumPhotosKey = encodeURIComponent(albumName) + '/';

      var photoKey = albumPhotosKey + fileName;
      s3.upload({
        Key: photoKey,
        Body: file,
        ACL: 'public-read' //Permet de lire la photo en public read à partir de l'url
      })
      .on('httpUploadProgress',function(evt){
        moveProgressBar(evt.loaded, evt.total);
        if (evt.loaded == evt.total) {
          progression ++;
        }
      })
      .send(function(err, data) {
        if (err) {
          return alert('There was an error uploading your photo: ', err);
        }
        console.log(data);
        souvenirObject.file_addresses.push(data.Location);
      });
    }
  }
}
// TODO: change ACL from public read to more private params

//Script to change label into number of files selected ----------------------------
$("#photoupload").change(function() {
  files = document.getElementById('photoupload').files;
  $( "#uploadLabel" ).text(files.length + ' images selectionnée(s). Cliquer sur transférer.');
});
$('.uploadLabelDiv').click(function(){
  $( "#photoupload" ).click();
});


//Script to create random fileName ----------------------------
function moveProgressBar(progress, total) {
  var barWidth = (progress/total)*100;
  $("#myBar").css("width", barWidth + "%");
  $( "#progressIndicator" ).text("Image "+ progression + " en cours de transfert...   " + parseInt(barWidth) + "%");
  if (progress == total && progression == fileLength) {
    $("#myBar").css("background-color", '#4CAF50');
    $( "#progressIndicator" ).text("Tous les fichiers ont été transferés");
    $( "#progressIndicator" ).css('color', '#4CAF50');

    //Make submitBtn back to normal
    setTimeout(function() {
      $('#submitBtnIcon').text('done');
      $('#submitBtnIcon').removeClass('spinning');
      $('.submitBtn').css('background-color', '#3fa435');
      $('.submitBtn').prop("disabled", false);
    }, 3000);
  }
}




//Script to create random fileName ----------------------------
function makeRandomId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 50; i++)  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// =============================================================================


// NOTE: SOUMETTRE LE SOUVENIR AU SERVEUR ======================================

$('.submitBtn').click(function() {
  // récupérer les valeurs des inputs
  souvenirObject.date = $('#dateInput').val();
  souvenirObject.description = $('#description').val();
  souvenirObject.titre = $('#titre').val();
  souvenirObject.lieu = $('#autocomplete').val();

  //Loading spinner initiated in submitbtn
  $('#submitBtnIcon').text('loop');
  $('#submitBtnIcon').addClass('spinning');
  $('.submitBtn').css('background-color', 'rgba(0,0,0,0)');
  $('.submitBtn').prop("disabled", true);

  $.post("/create_svnr", {svnr : souvenirObject}, function(data){
    if (data==='done') {
      window.location = '/';
    }else{console.log("error");}
  })

});

// =============================================================================


// NOTE: AFFICHER LES AMIS POUR LE PARTAGE =====================================

var sharedFriends = [];
var picIds = [];

$.post('/getAllMyFriends', function(friends) {
  if (friends) {
    for (var i in friends) {
      displayFriendsPic(friends[i]);
    }
  }
//   var container_width = 70 * $("#friendsDisplayScrollable img").length;
//    $("#friendsDisplayScrollable").css("width", container_width);
});

function displayFriendsPic(friend) {
  $('#friendsDisplayScrollable').append(
    '<div class="friendDiv">' +
      '<img id="'+ friend._id + '" onclick="friendsIsClicked(\''+ friend._id +'\')" src="'+ friend.photo_address +'" class="friendPic">' +
      '<p>'+ friend.username +'</p>' +
    '</div>'
  );
};

function friendsIsClicked(idFriend) {
  //Mettre / Enlever la surbrillance de la bulle
  var JQidFriend = '#' + idFriend;
  if ($(JQidFriend).hasClass('selected')) {
    console.log('was selected');
    $(JQidFriend).removeClass('selected');
  }
  else if (!$(JQidFriend).hasClass('selected')) {
    console.log('was NOT selected');
    $(JQidFriend).addClass('selected');
  }
};
// TODO: Create array of sharedFriends and functionalize put and delete from it
// TODO: refresh counter that displays number of selected persons

// =============================================================================


// NOTE: GOOGLE PLACE API ======================================================

var placeSearch, autocomplete;
function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        console.log(place.formatted_address);
}

// =============================================================================




// $(document).ready(function() {
//     $('select').material_select();
//
//     $('.datepicker').pickadate({
//     selectMonths: true, // Creates a dropdown to control month
//     selectYears: 15 // Creates a dropdown of 15 years to control year
//   });
//
//   $('#enter_hashtags').material_chip({
//     placeholder: 'Enter a tag',
//     secondaryPlaceholder: '#hastags',
//   });
//   $('#enter_tagfriends').material_chip({
//     placeholder: 'Ajouter des amis',
//     secondaryPlaceholder: 'Tagger des amis',
//   });
// });
//
// var idFile;
// $('#valider_btn').click(function(){
//   var titre = $('#titre').val();
//   var lieu = $('#pac-input').val();
//   var type = $('#type').val();
//   var svnr_date = $('#svnr_date').val();
//   if (!svnr_date) {svnr_date = new Date();}
//   var description = $('#description').val();
//   var tagfriends = $('#enter_tagfriends').val();
//   var hastags = $('#enter_hashtags').val();
//   var creation_date = new Date();
//
// $.post("/create_svnr", {titre:titre, lieu:lieu, type:type, svnr_date:svnr_date, description:description, file_address:idFile, creation_date:creation_date}, function(data){
//   if (data==='done') {
//     window.location = '/';
//   }else{console.log("error");}
// })
// });
//
// function getIdFile(id) {
//   idFile = id;
// }
//
// $('#cancel_btn').click(function(){
//   $.post("/deleteImg", {file_address:idFile}, function(response_cancel) {
//     if (response_cancel === 'done') {
//       window.location = '/';
//     }else {
//       console.log('error');
//     }
//   });
// });
//
// //MAPS api----------------------------------------------------------------------
//
// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 48.86667, lng: 2.333333},
//     zoom: 13
//   });
//   var input = /** @type {!HTMLInputElement} */(
//       document.getElementById('pac-input'));
//
//   var types = document.getElementById('type-selector');
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);
//
//   var autocomplete = new google.maps.places.Autocomplete(input);
//
//   var infowindow = new google.maps.InfoWindow();
//   var marker = new google.maps.Marker({
//     map: map,
//     anchorPoint: new google.maps.Point(0, -29)
//   });
//
//   autocomplete.addListener('place_changed', function() {
//     infowindow.close();
//     marker.setVisible(false);
//     var place = autocomplete.getPlace();
//     if (!place.geometry) {
//       // User entered the name of a Place that was not suggested and
//       // pressed the Enter key, or the Place Details request failed.
//       window.alert("No details available for input: '" + place.name + "'");
//       return;
//     }
//
//     // If the place has a geometry, then present it on a map.
//     if (place.geometry.viewport) {
//       map.fitBounds(place.geometry.viewport);
//     } else {
//       map.setCenter(place.geometry.location);
//       map.setZoom(17);  // Why 17? Because it looks good.
//     }
//     marker.setIcon(/** @type {google.maps.Icon} */({
//       url: place.icon,
//       size: new google.maps.Size(71, 71),
//       origin: new google.maps.Point(0, 0),
//       anchor: new google.maps.Point(17, 34),
//       scaledSize: new google.maps.Size(35, 35)
//     }));
//     marker.setPosition(place.geometry.location);
//     marker.setVisible(true);
//
//     var address = '';
//     if (place.address_components) {
//       address = [
//         (place.address_components[0] && place.address_components[0].short_name || ''),
//         (place.address_components[1] && place.address_components[1].short_name || ''),
//         (place.address_components[2] && place.address_components[2].short_name || '')
//       ].join(' ');
//     }
//
//     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
//     infowindow.open(map, marker);
//   });
//
//   // Sets a listener on a radio button to change the filter type on Places
//   // Autocomplete.
//   function setupClickListener(id, types) {
//     var radioButton = document.getElementById(id);
//     radioButton.addEventListener('click', function() {
//       autocomplete.setTypes(types);
//     });
//   }
//
//   setupClickListener('changetype-all', []);
//
// }
