////////////////////////////////////////////////////////////////////////////////

let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isMovingLeft = {value: false, timestamp: new Date().toISOString()};
let isMovingRight = {value: false, timestamp: new Date().toISOString()};
let isMovingUp = {value: false, timestamp: new Date().toISOString()};
let isMovingDown = {value: false, timestamp: new Date().toISOString()};

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
    let distX = Math.abs(circle.x - (rect.x - Math.abs(world.x) * (world.x > 0 ? -1 : 1)) - rect.width / 2);
    let distY = Math.abs(circle.y - (rect.y - Math.abs(world.y) * (world.y > 0 ? -1 : 1)) - rect.height / 2);

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

function render() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    world.update().draw();
    player.update().draw();

    window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);

////////////////////////////////////////////////////////////////////////////////

function World() {
    this.width = 5000;
    this.height = 5000;
    this.x = this.width / -3;
    this.y = this.height / -3;

    this.update = function() {
        if (isMovingLeft.value && (!isMovingRight.value || isMovingRight.timestamp < isMovingLeft.timestamp)) {
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
        } else if (isMovingRight.value) {
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
        if (isMovingUp.value && (!isMovingDown.value || isMovingDown.timestamp < isMovingUp.timestamp)) {
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
        } else if (isMovingDown.value) {
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
    this.speed = 5;

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
    let now = new Date().toISOString();
    if (e.code == 'KeyA') {
        isMovingLeft.value = true;
        isMovingLeft.timestamp = now;
    } else if (e.code == 'KeyD') {
        isMovingRight.value = true;
        isMovingRight.timestamp = now;
    } else if (e.code == 'KeyW') {
        isMovingUp.value = true;
        isMovingUp.timestamp = now;
    } else if (e.code == 'KeyS') {
        isMovingDown.value = true;
        isMovingDown.timestamp = now;
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
        isMovingLeft.value = false;
    } else if (e.code == 'KeyD') {
        isMovingRight.value = false;
    } else if (e.code == 'KeyW') {
        isMovingUp.value = false;
    } else if (e.code == 'KeyS') {
        isMovingDown.value = false;
    }
});

document.addEventListener('mousedown', function(e) {
    console.log(e);
});

////////////////////////////////////////////////////////////////////////////////
