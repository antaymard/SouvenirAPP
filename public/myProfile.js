$(document).ready(function(){

  $.post("/getAllMyFriends",{send : "1"},function(myFriends_data){
    if(myFriends_data) {
      console.log(myFriends_data);
      var i;
      for (i in myFriends_data) {
        if (!myFriends_data[i].photo_address) {myFriends_data[i].photo_address = "http://placehold.it/350x150"}
        var user_age = calcAge(myFriends_data[i].birthday);
        $('#myFriends_Space').append(
          '<div class="friendCard">'
        +     '<div class="card-image">'
        +       '<img class="imgFriend" src="' + myFriends_data[i].photo_address +'">'
        +     '</div>'
        +     '<div class="cardContent">'
        +        '<p>'+ myFriends_data[i].username + " - "+ myFriends_data[i].prenom + ' ' + myFriends_data[i].nom + '</p>'
        +        '<p>'+ user_age + " ans" + '</p>'
        +        '<div class="cardAction">'
        +        '<img class="togetherLogo" src="favicon-32x32.png"><span> 24</span>'
        // +           '<a href="#" class="exploreBtn">EXPLORER</a>'
        +        '</div>'
        +      '</div>'
        +  '</div>'
        );
      };
    }
  });

});

$("#input_photo").change(function() {
  console.log('click');
  //Envoie file
  $('#fileUp').submit();
});


function calcAge(dateString) {
var birthday = +new Date(dateString);
return ~~((Date.now() - birthday) / (31557600000));
};


// reactForm('#titre', 'titre', 'text');
//
//
//
// function reactForm(id, txt, type) {
// $(id).click(function(){
//   console.log('click on ' + id);
//     var name = $(this).text();
//     $(this).html('');
//     $('<input></input>')
//         .attr({
//             'type': type,
//             'name': 'fname',
//             'id': 'txt_' + txt,
//             'size': '30',
//             'value': name
//         })
//         .appendTo(id);
//     $('#txt_' + txt).focus();
// });
