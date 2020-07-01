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


// Function for appending messages
function appendMsg(message, position){
    const msgArea = document.querySelector('.msg-area-body')
    const msgElement = document.createElement('div')

    // Message for joining or leaving the room
    if (position==='center'){
        msgElement.classList.add('join-or-leave-msg')
    }

    //Message sent by the user
    else if (position==='right'){
        msgElement.classList.add('msg','you',position)
    }

    //Message recieved by the user
    else{
        msgElement.classList.add('msg', position)
    }

    msgElement.innerHTML = message
    msgArea.appendChild(msgElement)
    gotoBottom('message-body')
}


//Function for getting the current time
function currentTime(){
    const current_time = new Date().toLocaleTimeString([], {
        hour:'numeric', minute:'numeric', hour12:true
    })
    return current_time
}

// Function for auto-scrolling
function gotoBottom(id){
    var element = document.getElementById(id);
    element.scrollTop = element.scrollHeight - element.clientHeight;
 }

///////////The voice type function///////////////
function voiceType(){
    const msgInput = document.getElementById('user-message');
    const voiceInpBtn = document.getElementById('voice-type')

    //Getting speech recognition
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

    var grammar = '#JSGF V1.0;'

    //Initializing recognition object
    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;

    //Getting the speech to text
    recognition.onresult = function(event) {
        var last = event.results.length - 1;
        var command = event.results[last][0].transcript;
        msgInput.value = command  

    };

    //Stop recognition when stopped speaking
    recognition.onspeechend = function() {
        recognition.stop();
        M.toast.dismiss()
    };

    //Notify when an error comes
    recognition.onerror = function() {
        M.toast({html:'Sorry, there was an error in recgnition :(', classes: 'rounded'})
    }

    //Start recognition when button is pressed
    voiceInpBtn.addEventListener('click', function(){
        recognition.start();
        M.toast({html: 'Listening', classes:'rounded'})
    });
}

voiceType()


///////////////////User is typing function/////////////////////////
var typing = false;
var timeout = undefined;

function timeoutFunction(){
  socket.emit('typing', false)
}

document.getElementById('user-message').addEventListener('keydown', (e)=>{

    //If the user presses other key than enter
    if(e.keyCode!=13){
        socket.emit('typing', true)
        clearTimeout(timeout)
        timeout = setTimeout(timeoutFunction, 2000)
    }
    
    else{
        clearTimeout(timeout)
        timeout = setTimeout(timeoutFunction, 0)
    }
})



/////////////////All socket functions/////////////////////////

//Letting the server know when a user has joined
socket.emit('join-room', {username, room})

//Getting the current room
socket.on('current-room', room=>{
    var current_room = document.getElementById('chatroom-name')
    current_room.innerText = room
})

//Getting the list of people online
socket.on('online-people-list', people=>{

    //Updating the number of people online
    var people_online = document.getElementById('people-online')
    people_online.innerText = people.length

    //Updating the list of people online
    var people_list = document.getElementById('people-online-list')    
    people_list.innerHTML = `${people.map(user => `<li class="collection-item center">${user.username}</li>`).join('')}`
    
})

//Notify others when a new-user joins
socket.on('new-user', name=>{
    appendMsg(`${name} has joined the chat`, 'center')
})

//Getting the form for sending the messages
const msgForm = document.querySelector('.msg-send-form')
msgForm.addEventListener('submit', e=>{
    e.preventDefault()

    //Getting the user's entered message
    var msgInput = document.getElementById('user-message')
    var msg = msgInput.value

    //Emitting the message to the server
    socket.emit('send-message', msg)

    appendMsg(`<div class="msg-head">You</div>
                    ${msg}
                <span class="msg-time">
                    ${currentTime()}
                </span>`, 'right')

    //Emptying the msgbox after the msg is sent
    msgInput.value = ''
})

//On receiving a message ..
socket.on('receive-message', data=>{
    appendMsg(`<div class="msg-head">${data.username}</div>
                    ${data.message}
                <span class="msg-time">
                    ${currentTime()}
                </span>`, 'left')
})


//If somebody is typing..

const typing_status = document.getElementById('typing')

socket.on('Someone-typing', name=>{
    typing_status.innerText = `${name} is typing..`
})

socket.on('nobody-typing', ()=>{
    typing_status.innerText = ''
})


//When a user leaves the room
socket.on('leave', name=>{
    appendMsg(`${name} has left the chat`, 'center')
})