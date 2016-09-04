var urlG = "http://82.239.100.156:8000";
// var urlG = "http://127.0.0.1:8000";

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
  $(location).attr('href', urlG);
});

$("#validationButtonFile").click(function () {
  console.log('change');
  $('#fileUpForm').submit(function() {
        // $("#status").empty().text("File is uploading...");
        $(this).ajaxSubmit({

            error: function(xhr) {
        console.log('Error: ' + xhr.status);
            },

            success: function(response) {
        // $("#status").empty().text(response);
                console.log('ok');
            }
    });
        //Very important line, it disable the page refresh.
    return false;
    });
});

// $("#resteUpForm").submit(function(event) {
//   //event.preventDefault();
// };
