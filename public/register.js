$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});

var pseudo;
var ch;

$('.btn').click(function(){
  // $('#divForm').transition({ x: '-750px' });
  submitForm ();
})

$('#pseudo').focusout(function(){
  $('#divstate').removeClass('has-success has-error');
  $('#checkstate').removeClass('glyphicon glyphicon-ok form-control-feedback glyphicon-remove');
  $('#pseudo').prop('title', '');
  ch=0;

  pseudo = $("#pseudo").val().toUpperCase();
    $.post("/register/checkpseudo",{pseudo:pseudo},function(data){
      if(data==='match') {
        console.log('match');
        $('#checkstate').addClass('glyphicon glyphicon-remove form-control-feedback');
        $('#pseudo').prop('title', 'Pseudo indisponible !');
        $('#divstate').addClass('has-error');
      }
      if(data==='nomatchok') {
        ch=1;
        console.log('pseudo ok');
        $('#checkstate').addClass('glyphicon glyphicon-ok form-control-feedback');
        $('#divstate').addClass('has-success');
        $('#pseudo').prop('title', 'Pseudo disponible !');
      }
  });
});


$("#login").click(function(){
  console.log('click');
  submitForm ();
});

function alertRegister (state, mes1, mes2) {
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


function submitForm () {
  var prenom = $("#prenom").val().toUpperCase();
  var nom = $("#nom").val().toUpperCase();
  var email2 = $("#email2").val().toUpperCase();
  pseudo = $("#pseudo").val().toUpperCase();
  var pwd2 = $("#pwd2").val();
  var datebirth = $("#datebirth").val();
  var gender = $('input[name=gender]:checked').val();

  if (prenom && nom && email2 && pseudo && pwd2 && datebirth && gender && ch==1) {
    $.post("/register/new",{prenom:prenom, nom:nom, email:email2, pseudo:pseudo, pwd:pwd2, datebirth:datebirth, gender:gender},function(data){
      if(data==='done') {
        console.log('done user inscrit');
        window.location = '/';
      } else {
        console.log('pb inscription user');
      }
  });
}
if (!prenom || !nom || !email2 || !pseudo || !pwd2 || !datebirth || !gender) {
  alertRegister('danger', 'Attention ! ', 'Veuillez remplir tous les champs.');
}
if (ch==0) {
  alertRegister('danger', 'Attention ! ', 'Pseudo déjà existant');
}
else {console.log('autre pb field');
}
};
