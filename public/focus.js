var urlG = "http://82.239.100.156:8000";

$("#titreHeader").click(function() {
  $(location).attr('href', urlG);
});

//parse le string hashtags en mots séparés suivant ',_' + change en lien
$( document ).ready(function() {
    var hashtags = $("#hashtagsSpan").text();
    hashtags = hashtags.split(', ');
    $('#hashtagsSpan').remove();

    for (i in hashtags) {
      $('#hashtagsPlace').append('<span class="badge" id="hashtagsSpan">#' + hashtags[i] + '</span>');
    }
});

$('#supprButton').click(function(){
  $.get(window.location.pathname + "/delete", function(data){
    if(data==='done');
    $(location).attr('href', urlG);
  });
})

reactForm('#titre', 'titre', 'text');
reactForm('#lieu', 'lieu', 'text');
reactForm('#presentfriends', 'presentfriends', 'text');
reactForm('#sharedfriends', 'sharedfriends', 'text');
reactForm('#comments', 'comments', 'text');
reactForm('#date', 'date', 'date');


function reactForm(id, txt, type) {
$(id).click(function(){
  console.log('click on ' + id);
    var name = $(this).text();
    $(this).html('');
    $('<input></input>')
        .attr({
            'type': type,
            'name': 'fname',
            'id': 'txt_' + txt,
            'size': '30',
            'value': name
        })
        .appendTo(id);
    $('#txt_' + txt).focus();
});

$(document).on('blur','#txt_' + txt, function(){
    var name = $(this).val();
    //alert('Make an AJAX call and pass this parameter >> name=' + name);
    $(id).text(name);

    var lieu = $('#lieu').text();
      if (!lieu) {
        refillEmpty('#lieu');
      }
    var titre = $('#titre').text();
    if (!titre) {
      refillEmpty('#titre');
    }
    var presentfriends = $('#presentfriends').text();
    if (!presentfriends) {
      refillEmpty('#presentfriends');
    }
    var sharedfriends = $('#sharedfriends').text();
    if (!sharedfriends) {
      refillEmpty('#sharedfriends');
    }
    var linkedtoid = $('#linkedtoid').text();
    if (!linkedtoid) {
      refillEmpty('#linkedtoid');
    }

    var date = $('#date').text();
    if (!date) {
      $("#date").html('1900-01-01');
    }

    $.post(window.location.pathname + "/update", {lieu:lieu, titre:titre, presentfriends:presentfriends, sharedfriends:sharedfriends, linkedtoid:linkedtoid, date:date}, function(data){
      if(data==='synced'){
        console.log('synchronisé');
      }
      if (data==='err') {
        console.log('error synch');
      }
    });
});
}

function refillEmpty(id) {
  $(id).html('<i>Non renseigné</i>');
}
