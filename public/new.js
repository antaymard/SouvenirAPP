var urlG = "http://82.239.100.156:8000";

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

function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#blah').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#userPhoto").change(function(){
        readURL(this);
    });

// $("#resteUpForm").submit(function(event) {
//   //event.preventDefault();
// };
