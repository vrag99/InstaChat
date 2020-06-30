//Activating materialize dropdown
$('.dropdown-trigger').dropdown();

var selected_room = document.getElementById('room')

//Appending the selected chatroom name from the drpdown onto the textbox
function chatroom_select(selection){
    selected_room.value = selection            
}

