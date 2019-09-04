
//////////////////////////////////////////////////////////////////////////////// intitializations

let canvas = document.getElementById('back');
let context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player();
let goal = new Goal();
let particles = [];
let particlesCount = 150;
for (let i = 0; i < particlesCount; i++) {
    particles.push(new Particle());
}

let instructionButton = new Button(canvas.width / 2 - 120, canvas.height / 2, 25, 'instruction');
let playButton = new Button(canvas.width / 2, canvas.height / 2, 50, 'play');
let leaderButton = new Button(canvas.width / 2 + 120, canvas.height / 2, 25, 'leader');

let border = 50;
let connectionOppacity = 0;
let isPlaying = false;
let isGG = false;
let showInstruction = false;
let showLeaderBoard = false;
let godMode = false;
let score = 0;
let name = '';

let scoreRecords = JSON.parse(localStorage.getItem('leaderboard'));
if (!scoreRecords) {
    localStorage.setItem('leaderboard', JSON.stringify([]));
    scoreRecords = [];
}

let latestPlayer = localStorage.getItem('latestPlayer');
if (!latestPlayer) {
    latestPlayer = '';
}

//////////////////////////////////////////////////////////////////////////////// support functions

function reInitialize() {
    console.log('RE');
    isPlaying = false;
    isGG = false;
    showInstruction = false;
    showLeaderBoard = false;
    score = 0;
    particles = [];
    for (let i = 0; i < particlesCount; i++) {
        particles.push(new Particle());
    }
    player.life = 3;
    player.beams = 3;
    name = '';
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

function getHypothenuse(x1, y1, x2, y2) {
    let x = Math.abs(x1 - x2);
    let y = Math.abs(y1 - y2);
    return Math.sqrt((x * x) + (y * y));
};

function saveGameRecord() {
    scoreRecords.unshift({name, score});
    localStorage.setItem('leaderboard', JSON.stringify(scoreRecords));
    scoreRecords = JSON.parse(localStorage.getItem('leaderboard'));
    localStorage.setItem('latestPlayer', name);
    latestPlayer = localStorage.getItem('latestPlayer');
};

function getHighScorer() {
    scoreRecords.sort((a, b) => a.score > b.score ? -1 : 1);
    return scoreRecords.length ? scoreRecords[0] : {name: '', score: 0};
};

//////////////////////////////////////////////////////////////////////////////// draw functions

function clearCanvas() {
    context.fillStyle = 'rgba(0, 22, 52, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
};

function drawBorders() {
    let margin = border - player.radius;
    context.beginPath();
    context.moveTo(margin, margin);
    context.lineTo(canvas.width - margin, margin);
    context.lineTo(canvas.width - margin, canvas.height - margin);
    context.lineTo(margin, canvas.height-margin);
    context.lineTo(margin, margin);
    context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    context.stroke();
};

function drawParticleConnectionLines() {
    for (let i = 0; i < particles.length - 1; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let p1 = particles[i];
            let p2 = particles[j];
            let hyp = getHypothenuse(p1.x, p1.y, p2.x, p2.y);
            let dist = p1.radius + p2.radius + player.radius * 2 + 10;
            if (hyp < dist) {
                context.beginPath();
                context.moveTo(p1.x, p1.y);
                context.lineTo(p2.x, p2.y);
                context.strokeStyle = `rgba(255, 255, 255, ${(dist - hyp) / 20})`;
                context.stroke();
            }
        }
    }
};

function drawConnectivityLine() {
    connectionOppacity -= connectionOppacity > 0 ? 0.02 : 0; // draw particle connection
    context.beginPath();
    context.moveTo(player.x, player.y);
    context.lineTo(goal.x, goal.y);
    context.strokeStyle = `rgba(255, 255, 255, ${connectionOppacity})`;
    context.stroke();
};

function drawMainMenuStuff() {
    let x = canvas.width / 2;
    let y = canvas.height / 2;

    if (playButton.isHit()) {
        context.shadowColor = 'white';
        context.shadowBlur = 15;
    }

    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.fillStyle = '#001634';
    context.beginPath();
    context.moveTo(x - 120, y);
    context.lineTo(x, y - 120);
    context.lineTo(x + 120, y);
    context.lineTo(x, y + 120);
    context.lineTo(x - 120, y);
    context.fill();
    context.stroke();

    context.lineWidth = 3;
    context.strokeStyle = 'rgba(255, 255 ,255 , 0.6)';
    context.fillStyle = '#001634';
    context.beginPath();
    context.arc(x, y - 120, 25, Math.PI * 2, false);
    context.stroke();
    context.fill();
    context.beginPath();
    context.arc(x, y + 120, 25, Math.PI * 2, false);
    context.stroke();
    context.fill();
    context.beginPath();
    context.arc(x - 120, y, 25, Math.PI * 2, false);
    context.stroke();
    context.fill();
    context.beginPath();
    context.arc(x + 120, y, 25, Math.PI * 2, false);
    context.stroke();
    context.fill();
    context.lineWidth = 1;

    context.beginPath(); // right circles
    context.arc(x + 164, y, 12, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x + 104, y - 40, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x + 104, y + 40, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath(); // left circles
    context.arc(x - 164, y, 12, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 104, y - 40, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 104, y + 40, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath(); // top circles
    context.arc(x, y - 164, 12, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 40, y - 104, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x + 40, y - 104, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath(); // bottom circles
    context.arc(x, y + 164, 12, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 40, y + 104, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x + 40, y + 104, 10, Math.PI * 2, false);
    context.fill();
    context.beginPath(); // extra circles
    context.arc(x + 117, y + 117, 6, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 117, y + 117, 6, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x + 117, y - 117, 6, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.arc(x - 117, y - 117, 6, Math.PI * 2, false);
    context.fill();
    context.beginPath(); // bottom right square
    context.moveTo(x + 90, y + 90 - 20);
    context.lineTo(x + 90 + 20, y + 90);
    context.lineTo(x + 90, y + 90 + 20);
    context.lineTo(x + 90 - 20, y + 90);
    context.lineTo(x + 90, y + 90 -20);
    context.fill();
    context.beginPath(); // bottom left square
    context.moveTo(x - 90, y + 90 - 20);
    context.lineTo(x - 90 + 20, y + 90);
    context.lineTo(x - 90, y + 90 + 20);
    context.lineTo(x - 90 - 20, y + 90);
    context.lineTo(x - 90, y + 90 -20);
    context.fill();
    context.beginPath(); // upper left square
    context.moveTo(x - 90, y - 90 - 20);
    context.lineTo(x - 90 + 20, y - 90);
    context.lineTo(x - 90, y - 90 + 20);
    context.lineTo(x - 90 - 20, y - 90);
    context.lineTo(x - 90, y - 90 -20);
    context.fill();
    context.beginPath(); // upper right square
    context.moveTo(x + 90, y - 90 - 20);
    context.lineTo(x + 90 + 20, y - 90);
    context.lineTo(x + 90, y - 90 + 20);
    context.lineTo(x + 90 - 20, y - 90);
    context.lineTo(x + 90, y - 90 -20);
    context.fill();


    context.shadowBlur = 0;
};

function drawInstructions() {
    context.strokeStyle = 'white';
    context.fillStyle = 'rgba(0, 22, 52, 1)';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 270, Math.PI * 2, false);
    context.stroke();
    context.fill();
};

function drawLeaderboard() {
    context.strokeStyle = 'white';
    context.fillStyle = 'rgba(0, 22, 52, 1)';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 270, Math.PI * 2, false);
    context.stroke();
    context.fill();
};

//////////////////////////////////////////////////////////////////////////////// main loop

function render() {
    clearCanvas();

    context.fillStyle = 'rgba(255, 255, 255, 0.06)';
    context.shadowColor = 'white';
    context.shadowBlur = 15;
    for (let i = 0; i < 100; i++) {
        context.beginPath();
        context.arc(randomBetween(0, canvas.width), randomBetween(0, canvas.height), randomBetween(1, 5), Math.PI * 2, false);
        context.fill();
    }
    context.shadowBlur = 0;

    if (isGG) {
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = 'bold 80px Arial';
        context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 70);
        context.textAlign = 'center';
        context.font = '30px Arial';
        context.fillText('Your Score : ' + score, canvas.width / 2, canvas.height / 2 + 20);
        context.font = '20px Arial';
        context.fillText(score > getHighScorer().score ? 'New High Score!!!' : 'Highest Score : ' + getHighScorer().score, canvas.width / 2, canvas.height / 2 + 70);
        context.font = '30px Arial';
        context.fillText('Your Name : ' + name, canvas.width / 2, canvas.height / 2 + 200);
        if (name.length) {
            context.font = '12px Arial';
            context.fillText('Back', goal.x, goal.y + goal.radius + 10);
        }
    } else if (!isPlaying) {
        drawMainMenuStuff();
        playButton.draw();
        instructionButton.draw();
        leaderButton.draw();
        if (showInstruction) {
            drawInstructions();
        } else if (showLeaderBoard) {
            drawLeaderboard();
        }
    } else {
        drawBorders();
        for (let particle of particles) {// draw particles
            particle.update().draw();
        }
        drawParticleConnectionLines();
        context.fillStyle = 'rgba(255, 255, 255, 1)'; // draw life points
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Health:', 65, 18);
        for (let i = 1; i <= player.life; i++) { // draw hearts
            let x = (border * i) / 1.5 + 70;
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.arc(x, 22, 5, Math.PI * 2, false);
            context.fill();
            context.stroke();
            context.beginPath();
            context.arc(x - 7, 14, 5, Math.PI * 2, false);
            context.fill();
            context.stroke();
            context.beginPath();
            context.arc(x + 7, 14, 5, Math.PI * 2, false);
            context.fill();
            context.stroke();
        }
        context.fillText('Beams:', 230, 18);
        for (let i = 1; i <= player.beams; i++) { // draw beams
            let x = (border * i) / 1.5 + 240;
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.arc(x, 17, 10, Math.PI * 2, false);
            context.fill();
            context.stroke();
            context.fillStyle = 'rgba(0, 22, 52, 1)';
            context.beginPath();
            context.arc(x, 17, 5, Math.PI * 2, false);
            context.fill();
            context.stroke();
        }
        context.fillStyle = 'rgba(255, 255, 255, 1)'; // draw score
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.font = '12px Arial';
        context.fillText('Score:', 375, 18);
        context.font = 'bold 20px Arial';
        context.fillText(score, 420, 18);
        if (player.life <= 0) { // handle when player life hits zero
            isPlaying = false;
            isGG = true;
            particles = [];
            player.beams = 1;
        }
    }

    player.update().draw();
    goal.update().draw();
    drawConnectivityLine();
    if (getHypothenuse(player.x, player.y, goal.x, goal.y) < player.radius + goal.radius) { // check hit
        if (isGG && name.length) {
            saveGameRecord();
            reInitialize();
        } else {
            goal.reposition();
        }
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
    this.life = 3;
    this.beams = 3;
    this.auraOpacity = 0;
    this.update = function() {
        this.x += (this.destinationX - this.x) / 2;
        this.y += (this.destinationY - this.y) / 2;
        for (let i = 0; i < particles.length; i++) {
            if (getHypothenuse(this.x, this.y, particles[i].x, particles[i].y) < this.radius + particles[i].radius && !godMode) {
                this.life--;
                particles.splice(i, 1);
            }
        }
        this.auraOpacity -= 0.02;
        return this;
    };
    this.draw = function() {
        context.shadowColor = 'white';
        context.shadowBlur = this.auraOpacity > 0 ? 100 * this.auraOpacity : 0;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = `rgba(255, 255, 255, ${this.auraOpacity > 0 ? 1 : 0.5})`;
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
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
        if (isPlaying) {
            score++;
            player.beams = 3;
        }
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
        context.shadowColor = 'white';
        context.shadowBlur = connectionOppacity > 0 ? 100 * connectionOppacity : 0;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = `rgba(255, 255, 255, ${connectionOppacity > 0 ? 1 : 0.5})`;
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
    };
};

function Particle() {
    this.x = canvas.width - 200;
    this.y = canvas.height / 2;
    this.radius = randomBetween(5, 20);
    this.speed = 15;
    this.acceleration = 0.99;
    this.angle = randomBetween(0, 360);
    this.update = function() {
        this.x += Math.cos(this.angle * Math.PI / 180) * this.speed;
        this.y += Math.sin(this.angle * Math.PI / 180) * this.speed;
        this.speed *= this.acceleration;
        if (this.speed < 0.1) {
            this.speed = randomBetween(2,7);
            this.angle = randomBetween(0, 360);
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.angle = 540 - this.angle;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.angle = 540 - this.angle;
        }
        if (this.y + this.radius < 0) {
            this.y = canvas.height + this.radius;
        }
        if (this.y - this.radius > canvas.height) {
            this.y = 0 - this.radius;
        }
        return this;
    };
    this.draw = function() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = `rgba(255, 255, 255, ${this.speed-0.1})`;
        context.strokeStyle = '#ffffff';
        context.fill();
        context.stroke();
    };
}

function Button(x, y, r, type) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.type = type;
    this.isHit = function() {
        return getHypothenuse(this.x, this.y, player.x, player.y) < this.radius;
    };
    this.drawCutomType = function() {
        context.fillStyle = `rgba(255, 255 ,255 , ${this.isHit() ? 1 : 0.4})`;
        context.strokeStyle = `rgba(255, 255 ,255 , ${this.isHit() ? 1 : 0.7})`;
        if (this.type == 'play') {
            context.beginPath();
            context.moveTo(this.x - 15, this.y - 22);
            context.lineTo(this.x + 25, this.y);
            context.lineTo(this.x - 15, this.y + 22);
            context.lineTo(this.x - 15, this.y - 22);
            context.fill();
            context.stroke();
        } else if (this.type == 'instruction') {
            context.font = 'bold 33px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('?', this.x, this.y + 3);
            context.strokeText('?', this.x, this.y + 3);
        } else if (this.type == 'leader') {
            context.fillRect(this.x - 6 , this.y + 12, 12, 1);
            context.fillRect(this.x - 1 , this.y + 4 , 2 , 8);
            context.fillRect(this.x - 5 , this.y + 2 , 10, 1);
            context.fillRect(this.x - 7 , this.y - 1 , 14, 1);
            context.fillRect(this.x - 9 , this.y - 8 , 18, 5);
            context.fillRect(this.x - 7 , this.y - 10, 14, 2);
            context.fillRect(this.x - 9 , this.y - 14, 18, 3);
            context.strokeRect(this.x - 6 , this.y + 12, 12, 1);
            context.strokeRect(this.x - 5 , this.y + 2 , 10, 1);
            context.strokeRect(this.x - 9 , this.y - 8 , 18, 5);
            context.strokeRect(this.x - 9 , this.y - 14, 18, 3);
            context.beginPath();
            context.arc(this.x - 11, this.y - 6, 4, Math.PI * 2, false);
            context.stroke();
            context.beginPath();
            context.arc(this.x + 11, this.y - 6, 4, Math.PI * 2, false);
            context.stroke();
        }
    };
    this.draw = function() {
        context.shadowColor = 'white';
        context.shadowBlur = this.isHit() ? 15 : 0;
        context.lineWidth = 3;
        context.strokeStyle = `rgba(255, 255 ,255 , ${this.isHit() ? 1 : 0.6})`;
        context.fillStyle = '#001634';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        context.stroke();
        context.fill();
        context.lineWidth = 1;
        this.drawCutomType();
        context.shadowBlur = 0;
    };
}

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
    player.auraOpacity = 1;
    if (player.beams > 0) {
        connectionOppacity = 1;
    }
    if (isPlaying && !godMode) {
        player.beams--;
    }
});

canvas.addEventListener('click', function() {
    if (!isPlaying) {
        if (showInstruction || showLeaderBoard) {
            showInstruction = false;
            showLeaderBoard = false;
            return;
        }
        if (playButton.isHit()) {
            isPlaying = true;
            goal.x = canvas.width - 200;
            goal.y = canvas.height / 2;
            name = latestPlayer;
            return;
        }
        if (instructionButton.isHit()) {
            showInstruction = true;
            return;
        }
        if (leaderButton.isHit()) {
            showLeaderBoard = true;
            return;
        }
    }
});

window.addEventListener('keydown', function(e) {
    if (e.key.length == 1 && name.length < 16) {
        name = (name + e.key).toUpperCase();
    } else if (e.key == 'Backspace') {
        name = name.split('');
        name.pop();
        name = name.join('');
    } else if (e.key == 'Escape') {
        godMode = true;
    }
});

window.addEventListener('keyup', function(e) {
    godMode = false;
});

//////////////////////////////////////////////////////////////////////////////// draw functions

// There was once two quantumly entangled particles which can only get close to each other but may never meet as they are cosmically destined to stay away from each other.
//
// All the Quantum Universe's a stage, these two particles merely are players, but dance forever in unison.
//
// This is a story about our particle, forever seeking a way back to its unique partner.
//
// Our particle can seemingly sense its partner particle's relative space-time coordinate,
// however, its partner particle is always moving from one point in space to another,
// thus, making it more difficult for our particle to reunite with its partner particle.
// ( Click to activate quantum beam [.], this beam points to your destined pair )
// ( You have a max quantum beam charge of 3 )
//
// Other particles effortlessly bond with others, but not our particle.
// Our particle's attributes are so unique, rare, and inharmonious to other particles' vibrations,
// that just getting minimal contact with another particle could crush that particle to its most basic level before disappearing.
// Getting in contact with another particle could hurt both particles.
// ( Avoid getting in contact with other particles. Colliding with other particles will reduce your HP: <3)
//
// Only one particle in existence can withstand and match our particle's unique vibration, our particle's destined pair.
// Our pair particle is strong enough to not get crushed when getting in contact with our particle,
// in fact, it even empowers our particle, recharging its energy, but by doing this, it reduces its energy to the level that it can't
// handle our particle's vibrations, our pair particle should relocate. It knows that staying won't do any good. It must... move away.
// To restore its energy levels and regain its original vibration.
// Until they meet again.
// ( Getting in contact with you pair particle increases your score and recharges your quantum beam charge to 3, then teleports to another location )
