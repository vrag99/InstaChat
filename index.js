const express = require('express');

//Setting up our app
const app = express();
const server = require('http').createServer(app);
const path = require('path');

//Creating socket io websocket connection server
const io = require('socket.io')(server);
const port = process.env.PORT || 3000


//Specifying the static folder for our app
app.use(express.static(path.join(__dirname, 'public')));

//Getting our login page on load
app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/public/login.html')
})

//Storing the users info in here
users = []

//////////////////All socket functions//////////////////
io.on('connection', socket =>{
    
    //When a user joins a room
    socket.on('join-room', userData=>{
        const userInfo = {id: socket.id, username: userData.username, room: userData.room}
        users.push(userInfo)

        //Joining the specified room
        socket.join(userData.room)

        //Notify that a user has joined..
        socket.broadcast.to(userData.room).emit('new-user', userData.username)

        //Emit the current room-name
        io.to(userData.room).emit('current-room', userData.room)

        //Sending the list of online people
        var online_people = users.filter(user=> user.room === userData.room)
        io.to(userData.room).emit('online-people-list', online_people)
    })

    //Broadcast the sent message to all the people in the room
    socket.on('send-message', msg=>{
        const user = users.find(user=> user.id === socket.id)
        socket.broadcast.to(user.room).emit('receive-message',{ username: user.username, message: msg })
    })

    socket.on('disconnect', ()=>{

        //Getting the user who has left the chat and removing it from our users list
        var user = users.find(user=> user.id === socket.id)

        for(var i=0; i < users.length; i++){
            if (users[i] === user){
                users.splice(i, 1)
            }
        }

        if (user){
            //Notifying everyone in the room that the person has left
            socket.broadcast.to(user.room).emit('leave', user.username)

            //Updating the list of online people
            var online_people = users.filter(person=> person.room === user.room)
            io.to(user.room).emit('online-people-list', online_people)
        }


    })

    socket.on('typing', TorF=>{
        const user = users.find(user=>user.id === socket.id)

        //If someone is typing
        if(TorF==true){
            socket.broadcast.to(user.room).emit('Someone-typing', user.username)
        }

        //If nobody is typing
        else{
            socket.broadcast.to(user.room).emit('nobody-typing')
        }
    })
})



//Having the server to listen on the specified port
server.listen(port, ()=>console.log(`Listening on http://localhost:${port}`))