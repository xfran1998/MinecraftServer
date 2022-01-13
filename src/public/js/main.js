import {GameState, Display} from './gameClient.js';

const socket = io();
const container = document.querySelector('.container');
const btn = document.querySelectorAll('.btn');
const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');

var input = {
    type: false,
    key: 'z'
};

socket.on('server', (message) => {
    let el = document.createElement('div');
    el.classList = "key-container";
    el.innerHTML = `<p>${message}</p>`;

    container.appendChild(el);
    console.log('Hijo añadido: ', message);
});

socket.on('server_start_game', (TAM_GAME) => {
    console.log('****  GAME START  ****');

    canvas.width = TAM_GAME.width;
    canvas.height = TAM_GAME.height;

    Display.context = context;
    Display.myGameState = new GameState();;
    Display.Draw();
    
    canvas.classList.remove('hidden');
    container.classList.add('hidden');
});

socket.on('server_update_players', (info) => {
    Display.myGameState.SetPlayers(info.players);
    Display.myGameState.SetProjectiles(info.projectiles);
});

function UpdateKey(type, key){
    if (input.type == type && input.key == key) // if haven't changed
    return;
    
    input.type = type;
    input.key = key;
    
    // if (input.type != type) console.log(`type: ${input.type} - ${type}`);
    // if (input.key != type) console.log(`key: ${input.key} - ${key}`);
    
    socket.emit('client_update_key', input);   
}

function join_server(server){
    socket.emit('client_join_room', server);
}

document.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase()
    if (key == 'a' || key == 'w' || key =='s' || key =='d')
        UpdateKey(true, key);
    else if(e.key == 'q' || e.key == 'Q')
        socket.emit('client_use_hability', 'q');
});

document.addEventListener('keyup', (e) => {
    UpdateKey(false, e.key);
});

// Click - Spawn projectile to mouse pos
addEventListener('click', (e) => {
    socket.emit('client_use_hability', 'attack');
});

btn.forEach( (el) => {
    el.addEventListener('click', () => {
        console.log(el.innerHTML);
        join_server(el.innerHTML);
    });
});