const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socketio(server);
const child_process = require('child_process');

var img_buff;
var flag=true;


// Seteando carpeta estatica, carpeta donde contiene todos los datos que requiere el usuario cuando hace la peticion
// a la web buscando recursos.
app.use(express.static(path.join(__dirname, 'public')))

// Funcion que se ejecuta cuando un usuario se conecta al websocket
io.on('connection', (socket) => {
    console.log("Nueva conexion!!");

    // Envia mensaje al usuario que se ha conectado
    // socket.emit('server', 'Init Player');
    
    // Envia mensaje a todos menos al usuario que se ha conectado
    // socket.broadcast.emit('server', 'Alguien se ha conectado!!!');

    // Envia mensaje a todos los usuaios
    // io.emit();
  

    run_script("python", ["main.py"], {cwd:"C:\\OneDrive\\OneDrive - Universitat de Valencia\\Python\\PirateBot"}, function(buf) {
        // img_buff = buf;
        // console.log('imagen');
        socket.emit('image', buf);
    });
    // setInterval(function() {
    //     socket.emit('image', img_buff);
    //     console.log('send image');
    // }, 1);

    console.log('new interval');

    socket.on("disconnecting", () => {
        console.log("**** DISCONNECTING ****");
        console.log(socket.id);
        console.log("**********************");
    });  
})

server.listen(PORT, () => {console.log(`runing on port ${PORT}`);});

function run_script(command, args, cwd, callback) {
    console.log("Starting Process.");
    var child = child_process.spawn(command, args, cwd);

    child.stdout.setEncoding('ascii');
    child.stdout.on('data', function(data) {
        callback(data);
    });

    child.stderr.setEncoding('ascii');
    child.stderr.on('data', function(data) {
        console.log("Error: " + data);
    });

    child.on('close', function() {
        console.log('finish code: ' + child.exitCode);
    });
}

