$(document).ready(function() {
    $('select').material_select();

    $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
  });

  $('#enter_hashtags').material_chip({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '#hastags',
  });
  $('#enter_tagfriends').material_chip({
    placeholder: 'Ajouter des amis',
    secondaryPlaceholder: 'Tagger des amis',
  });
});

var idFile;
$('#valider_btn').click(function(){
  var titre = $('#titre').val();
  var lieu = $('#pac-input').val();
  var type = $('#type').val();
  var svnr_date = $('#svnr_date').val();
  if (!svnr_date) {svnr_date = new Date();}
  var description = $('#description').val();
  var tagfriends = $('#enter_tagfriends').val();
  var hastags = $('#enter_hashtags').val();
  var creation_date = new Date();

$.post("/create_svnr", {titre:titre, lieu:lieu, type:type, svnr_date:svnr_date, description:description, file_address:idFile, creation_date:creation_date}, function(data){
  if (data==='done') {
    window.location = '/';
  }else{console.log("error");}
})
});

function getIdFile(id) {
  idFile = id;
}

$('#cancel_btn').click(function(){
  $.post("/deleteImg", {file_address:idFile}, function(response_cancel) {
    if (response_cancel === 'done') {
      window.location = '/';
    }else {
      console.log('error');
    }
  });
});

//MAPS api----------------------------------------------------------------------

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.86667, lng: 2.333333},
    zoom: 13
  });
  var input = /** @type {!HTMLInputElement} */(
      document.getElementById('pac-input'));

  var types = document.getElementById('type-selector');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    marker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
  });

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);

}
