$(document).ready(function(){
    var email,pass;
    $("#submit").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
        switch (email) {
          case "antoine":
          case "Antoine":
          email = "12345"
          break;
          case "paul":
          case "Paul":
          email = "22345"
          break;
          case "victor":
          case "Victor":
          email = "32345"
          break;
          case "alex":
          case "Alex":
          email = "42345"
          break;
          case "alix":
          case "Alix":
          email = "52345"
          break;
        }
        if (isNaN(email)==true) {
          alert('invalid user name');
          window.location.href="/";
        }
        /*
        * Perform some validation here.
        */
        $.post("/signin",{email:email,pass:pass},function(data){
            if(data==='done')
            {
                window.location.href="/";
            }
        });
    });
});

$("#titreHeader").click(function() {
  $(location).attr('href', urlG);
});
