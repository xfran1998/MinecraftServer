const socket = io();

var ctx = document.getElementById('canvas').getContext('2d');
var flag=true;

var img = new Image();
socket.on("image", function(imagen) {
    console.log('imagen');
    img.src = 'data:image/jpg;base64,' + imagen;
    // document.body.appendChild(img);
    flag=false;
});

setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
}, 10);