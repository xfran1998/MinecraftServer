const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { randomInt } = require('crypto');
const Game = require('./Game');

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socketio(server);

// class user{
//     constructor(name, room) {
//         this.name = name;
//         this.room = room;
//     }

    
// }
const users = [];
const rooms = {};
const games = [];

// 960, 468.5
// 1920 937
const TAM_GAME = {width: 1920, height: 935};
const FPS = 60;

let myGame = new Game(TAM_GAME, FPS);

// Seteando carpeta estatica, carpeta donde contiene todos los datos que requiere el usuario cuando hace la peticion
// a la web buscando recursos.
app.use(express.static(path.join(__dirname, 'public')))

const colors = ['blue','red'];

let cont=0;
console.log("Empezando!!");
// Funcion que se ejecuta cuando un usuario se conecta al websocket
io.on('connection', (socket) => {
    console.log("Nueva conexion!!");

    // Envia mensaje al usuario que se ha conectado
    // socket.emit('server', 'Init Player');
    
    // Envia mensaje a todos menos al usuario que se ha conectado
    // socket.broadcast.emit('server', 'Alguien se ha conectado!!!');

    // Envia mensaje a todos los usuaios
    // io.emit();

    socket.on("disconnecting", () => {
        // Deleting users
        
        // Deleting user form rooms if was in
        // let room = users[socket.id].room;
        // var ind = rooms[room].indexOf(socket.id);
        // rooms[room].splice(ind, 1);
        
        // if (users[socket.id]);
        //     delete users[socket.id];


        console.log("**** DISCONNECTING ****");
        console.log(socket.id);
        console.log(users);
        console.log(rooms);
        console.log("**********************");
    });   
    
    // Envia mensaje cuando cliente se desconecta
    socket.on('disconnect', () => {
        console.log("Disconect");
        // io.emit('server', 'Alguien se ha desconectado!!!');
    });
        
    // socket.on('client_key', (room_id) => {
    //     socket.broadcast.emit('server', room_id);
    // });
            
    // socket.on('client_move', (move) =>{
    // users[socket.id].x += move.x;
    // users[socket.id].y += move.y;
    
    // console.log("**** MOVING ****");
    // console.log(users);
    // console.log(rooms);
    // console.log("**********************");
    // });

    socket.on('client_join_room', (room_id) => {
        // if (users[socket.id]){ //if user exist on a room don't use it 
        //     return;
        // }

        if (rooms[room_id] && rooms[room_id].length == 2){
            return;
        }
        
        // Create player
        let coords = [randomInt(TAM_GAME.width),randomInt(TAM_GAME.height)];
        
        myGame.SpawnPlayer(socket.id, 50, coords, colors[cont], 10, `Player${cont++}`, 200); // debug only

        // Crea sala
        // if (!rooms[room_id])
        //     rooms[room_id] = [users,users[socket.id]];
        // else{
        //     rooms[room_id].push({user: socket.id, data: users[socket.id]});
        // }
        if (!rooms[room_id])
            rooms[room_id] = [socket.id];
        else{
            rooms[room_id].push(socket.id);
        }

        socket.join(room_id);
        // var room = io.sockets.adapter.rooms[room_id];
        io.to(room_id).emit('server', 'New Player Joined: ' + socket.id);

        // let nameRoom = "Room1";

        console.log(users);
        console.log(rooms);
        

        let return_msg = {status: 'ok', response: {users: users, rooms: rooms}};
        socket.broadcast.emit('server_new_room', return_msg);

        if (rooms[room_id] && rooms[room_id].length == 2){
            const emit_server = (room) => {
                // console.log(`emiting to: ${room}`);
                let info =  myGame.GetInfoSendClient();
                io.to(room).emit('server_update_players', info);
            };
            
            io.to(room_id).emit('server_start_game', TAM_GAME);
            
            console.log(room_id);
            io.to(room_id).emit('test', 'testing');
            
            myGame.Run([room_id], emit_server);
            console.log('****  GAME START  ****')
            return;
        }
    });

    socket.on('client_update_key', (input) => {
        input.idPlayer = socket.id;
        myGame.UpdatePlayerKeys(input);
        console.log("**** MOVING ****");
        // console.log(myGame.GetPlayersKeys());
        console.log(myGame.GetPlayersDir());
        console.log("**********************");
    })


    // **** USER USES HABILITIES ****
    socket.on('client_use_hability', (hability) =>{
        let player = myGame.GetPlayer(socket.id);
        let enemy = myGame.GetEnemyPlayers(socket.id);

        console.log({enemy});
        let info;

        if (!myGame.gameStarted) return

        switch (hability){
            case 'attack':
                myGame.SpawnProjectile(15, player.GetPos(), player.GetColor(), 20, enemy[0].GetPos(), player);
                info = myGame.GetInfoSendClient();
                // io.to(room_id).emit('server_update_players', info);
                break;
            case 'q':
                myGame.SpawnIncomingProjectiles(10, 5, 20, player.GetColor(), 20, enemy[0].GetPos(), player);
                info = myGame.GetInfoSendClient();
                break;
        }
    });
})


server.listen(PORT, () => {console.log(`runing on port ${PORT}`);});