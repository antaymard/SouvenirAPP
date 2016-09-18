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
