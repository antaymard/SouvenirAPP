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

  pseudo = $("#pseudo").val();
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
  var prenom = $("#prenom").val();
  var nom = $("#nom").val();
  var email1 = $("#email1").val();
  var email2 = $("#email2").val();
  pseudo = $("#pseudo").val();
  var pwd1 = $("#pwd1").val();
  var pwd2 = $("#pwd2").val();
  var datebirth = $("#datebirth").val();
  var gender = $('input[name=gender]:checked').val();

  if (prenom && nom && email1 && email2 && pseudo && pwd1 && pwd2 && datebirth && gender && ch==1 && email1==email2 && pwd1==pwd2) {
    $.post("/register/new",{prenom:prenom, nom:nom, email:email1, pseudo:pseudo, pwd:pwd1, datebirth:datebirth, gender:gender},function(data){
      if(data==='done') {
        console.log('done user inscrit');
        window.location = '/';
      } else {
        console.log('pb inscription user');
      }
  });
}
if (!prenom || !nom || !email1 || !email2 || !pseudo || !pwd1 || !pwd2 || !datebirth || !gender) {
  alertRegister('danger', 'Attention ! ', 'Veuillez remplir tous les champs.');
}
if (email1!==email2) {
  alertRegister('danger', 'Attention ! ', 'Emails différents.');
}
if (pwd1!==pwd2) {
  alertRegister('danger', 'Attention ! ', 'Mots de passe différents.');
}
if (ch==0) {
  alertRegister('danger', 'Attention ! ', 'Pseudo déjà existant');
}
else {console.log('autre pb field');
}
};
