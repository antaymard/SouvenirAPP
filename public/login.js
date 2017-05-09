$(document).ready(function(){
  var username,pwd;


  $("#login").click(function(){
    console.log('click');
    submitForm ();
  });
});

// $("#register").click(function(){
//   window.location = '/register';
// });

//Entrer pour valider form
$("input").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        console.log('enter');
        submitForm ();
    }
});

function submitForm () {
  username=$("#username").val().toUpperCase();
  pwd=$("#password").val();
  console.log(username);

  if (!pwd) {
    alertLogin("warning", "", "Veuillez indiquer votre mot de passe.")
  }
  else {
    $.post("/login",{username:username,pwd:pwd},function(data){
      if(data==='done') {
        console.log('done');
        if (screen.width <= 800) {
            window.location = "/mobileIndex";
          } else {
            window.location = '/';
          }
      }
      if(data==='pb pwd') {
        console.log('pb pwd');
        alertLogin("danger", "Erreur ! ", "Mot de passe incorrect.");
      }
      if(data==='no match') {
        console.log('no match');
        alertLogin("danger", "Erreur ! ", "Pas de compte à ce nom.");
      }
  });
  }
};

function alertLogin (state, mes1, mes2) {
  $('#state').append( '<div class="alert alert-' + state + '">'
  +'<strong>' + mes1 + '</strong>' + mes2
  +'</div>');
  $('#state').transition({ opacity: 1 });

  setTimeout(function(){
    $('#state').transition({ opacity: 0 });
  }, 2000);

  setTimeout(function(){
    $('#state').empty();
  }, 2300);
}
