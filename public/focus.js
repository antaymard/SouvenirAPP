var urlG = "http://82.239.100.156:8000";

$(window).scroll(function() {
  if ($(document).scrollTop() > 30) {
    $('#titreHeader').css('font-size', "15px");
    $('#titreHeader').css('margin', "3px 0 2px 0");
  } else {
    $('#titreHeader').css('font-size', "22px");
    $('#titreHeader').css('margin', "15px 0 7px 0");
  }
});

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
