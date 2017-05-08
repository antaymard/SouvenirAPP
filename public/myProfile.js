$(document).ready(function(){

  $.post("/friends_recall",{send : "1"},function(myFriends_data){
    if(myFriends_data) {
      console.log(myFriends_data);
      var i;
      for (i in myFriends_data) {
        if (!myFriends_data[i].photo_address) {myFriends_data[i].photo_address = "http://placehold.it/350x150"}
        var user_age = calcAge(myFriends_data[i].birthday);
        $('#myFriends_Space').append(
          '<div class="col m6">'
        + '<div class="card horizontal" style="max-height:280px">'
        + '<div class="card-image">'
        + '<img style="height:100%; object-fit:cover" src="' + myFriends_data[i].photo_address +'">'
        + '</div>'
        + '<div class="card-stacked">'
        + '<div class="card-content">'
        + '<p style="font-size:19px;font-weight:500">'+ myFriends_data[i].username + '</p>'
        + '<p style="font-size:17px;font-weight:400">'+ myFriends_data[i].prenom + ' ' + myFriends_data[i].nom + '</p>'
        + '<p style="font-size:15px;font-weight:400">de '+ myFriends_data[i].living_city + '</p>'
        + '<p style="font-size:15px;font-weight:400;margin-top:5px" class="teal-text">Actuellement à '+ myFriends_data[i].current_city + '</p></div>'
        + '<div class="card-action">'
        + '<a href="#" class="red-text">UNFRIEND</a>'
        + '</div></div></div></div>'
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
