
//////////////////////////////////////////////////////////////////////////////// intitializations

let canvas = document.getElementById("back");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player();
let goal = new Goal();

let border = 50;
let connectionOppacity = 0;

//////////////////////////////////////////////////////////////////////////////// support functions

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

function getHypothenuse(x1, y1, x2, y2) {
    var x = Math.abs(x1 - x2);
    var y = Math.abs(y1 - y2);
    return Math.sqrt((x * x) + (y * y));
};

function clearCanvas() {
    context.fillStyle = "#001634";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawBorders();
};

function drawBorders() {
    let margin = border - player.radius;
    context.beginPath();
    context.moveTo(margin, margin);
    context.lineTo(canvas.width - margin, margin);
    context.lineTo(canvas.width - margin, canvas.height - margin);
    context.lineTo(margin, canvas.height-margin);
    context.lineTo(margin, margin);
    context.strokeStyle = "rgba(255, 255, 255, 0.15)";
    context.stroke();
};

//////////////////////////////////////////////////////////////////////////////// main loop

function render() {
    clearCanvas();

    player.update().draw();
    goal.update().draw();

    connectionOppacity -= connectionOppacity > 0 ? 0.01 : 0; // draw particle connection
    context.beginPath();
    context.moveTo(player.x, player.y);
    context.lineTo(goal.x, goal.y);
    context.strokeStyle = `rgba(255, 255, 255, ${connectionOppacity})`;
    context.stroke();

    if (getHypothenuse(player.x, player.y, goal.x, goal.y) < player.radius + goal.radius) { // check hit
        goal.reposition();
    }

    window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);

//////////////////////////////////////////////////////////////////////////////// objects

function Player() {
    this.x = 200;
    this.y = canvas.height / 2;
    this.radius = 15;
    this.speed = 10;
    this.destinationX = this.x;
    this.destinationY = this.y;
    this.update = function() {
        this.x += (this.destinationX - this.x) / 3;
        this.y += (this.destinationY - this.y) / 3;
        return this;
    };
    this.draw = function() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.strokeStyle = "#ffffff";
        context.fill();
        context.stroke();
    };
};

function Goal() {
    this.x = canvas.width - 200;
    this.y = canvas.height / 2;
    this.radius = 15;
    this.acceleration = 0.9;
    this.speed = randomBetween(3, 7);
    this.angle = randomBetween(0, 360);
    this.reposition = function() {
        this.x = randomBetween(border, canvas.width - border);
        this.y = randomBetween(border, canvas.height - border);
    };
    this.update = function() {
        let dx = Math.cos(this.angle * Math.PI / 180) * this.speed;
        let dy = Math.sin(this.angle * Math.PI / 180) * this.speed;
        this.speed *= this.acceleration;
        if (this.speed < 0.1) {
            this.speed = randomBetween(3, 7);
            this.angle = randomBetween(0, 360);
        }
        this.x += dx;
        this.y += dy;
        if (this.x < border) {
            this.x = border;
        }
        if (this.x > canvas.width - border) {
            this.x = canvas.width - border;
        }
        if (this.y < border) {
            this.y = border;
        }
        if (this.y > canvas.height - border) {
            this.y = canvas.height - border;
        }
        return this;
    };
    this.draw = function() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.strokeStyle = "#ffffff";
        context.fill();
        context.stroke();
    };
};

//////////////////////////////////////////////////////////////////////////////// events

canvas.addEventListener('mousemove', function (e) {
    if (e.pageX > border && e.pageX < canvas.width - border) {
        player.destinationX = e.pageX;
    }
    if (e.pageY > border && e.pageY < canvas.height - border) {
        player.destinationY = e.pageY;
    }

    if (e.pageX <= border) {
        player.destinationX = border;
    } else if (e.pageY <= border) {
        player.destinationY = border;
    } else if (e.pageX >= canvas.width - border) {
        player.destinationX = canvas.width - border;
    } else if (e.pageY >= canvas.height - border) {
        player.destinationY = canvas.height - border;
    };
});

canvas.addEventListener('mousedown', function() {
    connectionOppacity = 0.3;
});

////////////////////////////////////////////////////////////////////////////////
