//Initializing socket io
const socket = io()

//Initializing materialize tooltips and modal
$(document).ready(function(){
    $('.tooltipped').tooltip({enterDelay:800});
    $('.modal').modal();
});


//Getting username and room from the url
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix : true,
})

/////////////////All socket functions/////////////////////////

//Letting the server know when a user has joined
socket.emit('join-room', {username, room})

//Getting the current room
socket.on('current-room', room=>{
    var current_room = document.getElementById('chatroom-name')
    current_room.innerText = room
})

//Updating the list of people online
socket.on('online-people-list', people=>{

    //Updating the number of people online
    var people_online = document.getElementById('people-online')
    people_online.innerText = people.length

    //Updating the list of people online
    var people_list = document.getElementById('people-online-list')    
    people_list.innerHTML = `${people.map(user => `<li class="collection-item center">${user.username}</li>`).join('')}`
    
})