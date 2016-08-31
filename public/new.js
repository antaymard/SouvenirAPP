//Reduce header au scroll
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
  $(location).attr('href', 'http://127.0.0.1:8000');
});

$("#validationButtonFile").click(function () {
  $("input").prop('disabled', false);
});

// $("#resteUpForm").submit(function(event) {
//   //event.preventDefault();
// };
