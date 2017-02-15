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
  var lieu = $('#lieu').val();
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
