const http = require('http');
const express = require('express');

const app = express();
app.use(express.static(__dirname+'/static'))
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
})

let rooms = {};

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection',(socket)=>{
    socket.on('room-joined',(data)=>{
        rooms[socket.id] = data.room;
        socket.join(data.room);
    })
    socket.on('disconnect',()=>{
        delete rooms[socket.id];
    })
    socket.on('join-room-request',(data)=>{
        var roomFound = false;
        for (const item of Object.entries(rooms)) {
            if(item[1] == data){
                roomFound = true;
                socket.join(data);
                rooms[socket.id] = data;
                io.to(data).emit('players-ready',data)
                break;
            }else{
                roomFound = false;
            }
        }
        socket.to(socket.id).emit('joined-or-not',roomFound);
    })
    socket.on('score-up',(score)=>{
        socket.to(rooms[socket.id]).emit('score-increased',score);
    })
})

server.listen(port,()=>{
    console.log(`SERVER running on port ${port}`);
})