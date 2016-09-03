$(document).ready(function(){
    var email,pass;
    $("#submit").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
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
