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


//Having the server to listen on the specified port
server.listen(port, ()=>console.log(`Listening on http://localhost:${port}`))