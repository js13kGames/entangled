////////////////////////////////////////////////////////////////////////////////

let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player();
let world = new World();

let pebbles = generatePebbles();
function generatePebbles() {
    let arr = [];
    for (let i = 0; i < 300; i++) {
        arr.push({
            x: randomBetween(0, world.width),
            y: randomBetween(0, world.height),
            radius: randomBetween(3, 8),
            draw: function() {
                context.lineWidth = 3;
                context.beginPath();
                context.arc(world.x + this.x, world.y + this.y, this.radius, Math.PI * 2, false);
                context.fillStyle = 'rgba(50, 50, 50, 0.6)';
                context.fill();
            }
        });
    }
    return arr;
};

let rocks = generateRocks();
function generateRocks() {
    let arr = [];
    for (let i = 0; i < 50; i++) {
        arr.push({
            x: randomBetween(300, world.width - 300),
            y: randomBetween(300, world.height - 300),
            width: randomBetween(100, 300),
            height: randomBetween(100, 300),
            draw: function() {
                context.lineWidth = 3;
                context.fillStyle = 'rgba(50, 50, 50, 1)';
                context.fillRect(world.x + this.x, world.y + this.y, this.width, this.height);
            }
        });
    }
    return arr;
};

function randomBetween(min,max) {
    return Math.floor(Math.random()*(max-min))+min;
}

function RectCircleColliding(circle, rect) {
    let distX = Math.abs(circle.x - (rect.x - Math.abs(world.x)) - rect.width / 2);
    let distY = Math.abs(circle.y - (rect.y - Math.abs(world.y)) - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) {
        return false;
    }
    if (distY > (rect.height / 2 + circle.radius)) {
        return false;
    }

    if (distX <= (rect.width / 2)) {
        return true;
    }
    if (distY <= (rect.height / 2)) {
        return true;
    }

    let dx = distX - rect.width / 2;
    let dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
};

////////////////////////////////////////////////////////////////////////////////

setInterval(() => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    world.update().draw();
    player.update().draw();

}, 60);

////////////////////////////////////////////////////////////////////////////////

function World() {
    this.width = 5000;
    this.height = 5000;
    this.x = this.width / -3;
    this.y = this.height / -3;

    this.update = function() {
        if (player.isMovingLeft) {
            this.x += player.speed;
            if (player.x - player.radius <= this.x) {
                this.x = player.x - player.radius;
            }
            for (let rock of rocks) {
                if (RectCircleColliding(player, rock)) {
                    this.x -= rock.x + this.x + rock.width - player.x + player.radius + 1;
                    break;
                }
            }
        } else if (player.isMovingRight) {
            this.x -= player.speed;
            if (player.x + player.radius >= this.x + this.width) {
                this.x = player.x + player.radius - this.width;
            }
            for (let rock of rocks) {
                if (RectCircleColliding(player, rock)) {
                    this.x += player.x + player.radius - rock.x - this.x + 1;
                    break;
                }
            }
        }
        if (player.isMovingUp) {
            this.y += player.speed;
            if (player.y - player.radius <= this.y) {
                this.y = player.y - player.radius;
            }
            for (let rock of rocks) {
                if (RectCircleColliding(player, rock)) {
                    this.y -= rock.y + this.y + rock.height - player.y + player.radius + 1;
                    break;
                }
            }
        } else if (player.isMovingDown) {
            this.y -= player.speed;
            if (player.y + player.radius >= this.y + this.height) {
                this.y = player.y + player.radius - this.height;
            }
            for (let rock of rocks) {
                if (RectCircleColliding(player, rock)) {
                    this.y += player.y + player.radius - rock.y - this.y + 1;
                    break;
                }
            }
        }
        return this;
    };

    this.draw = function() {
        context.lineWidth = 10;
        context.strokeStyle = 'rgba(0, 0, 0, 1)';
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'gray';
        context.fillRect(this.x, this.y, this.width, this.height);

        for (let pebble of pebbles) {
            pebble.draw();
        }
        for (let rock of rocks) {
            rock.draw();
        }
    }
}

function Player() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 30;
    this.speed = 30;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isMovingUp = false;
    this.isMovingDown = false;

    this.update = function() {

        return this;
    };

    this.draw = function() {
        context.lineWidth = 3;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.fill();
    }
}

////////////////////////////////////////////////////////////////////////////////

document.addEventListener('keydown', function(e) {
    if (e.code == 'KeyA') {
        player.isMovingRight = false;
        player.isMovingLeft = true;
    } else if (e.code == 'KeyD') {
        player.isMovingLeft = false;
        player.isMovingRight = true;
    } else if (e.code == 'KeyW') {
        player.isMovingDown = false;
        player.isMovingUp = true;
    } else if (e.code == 'KeyS') {
        player.isMovingUp = false;
        player.isMovingDown = true;
    } else if (e.code == 'Space') {
        // fire
    } else if (e.code == 'Digit1') {
        // equip 1
    } else if (e.code == 'Digit2') {
        // equip 1
    } else if (e.code == 'Digit3') {
        // equip 1
    }
});

document.addEventListener('keyup', function(e) {
    if (e.code == 'KeyA') {
        player.isMovingLeft = false;
    } else if (e.code == 'KeyD') {
        player.isMovingRight = false;
    } else if (e.code == 'KeyW') {
        player.isMovingUp = false;
    } else if (e.code == 'KeyS') {
        player.isMovingDown = false;
    }
});

document.addEventListener('mousedown', function(e) {
    console.log(e);
});

////////////////////////////////////////////////////////////////////////////////
