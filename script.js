
//////////////////////////////////////////////////////////////////////////////// intitializations

let canvas = document.getElementById('back');
let context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = new Player();
let goal = new Goal();
let particles = [];
let particlesCount = getParticleCount();
for (let i = 0; i < particlesCount; i++) {
    particles.push(new Particle());
}

let playButton = new Button(280, canvas.height / 2, 50, 'play');
let instructionButton = new Button(280 - 67, canvas.height / 2 - 67, 30, 'instruction');
let leaderButton = new Button(280 + 67, canvas.height / 2 + 67, 30, 'leader');
let randButton = new Button(200, canvas.height / 2, 15, 'random');

let border = 50;
let connectionOppacity = 0;
let isPlaying = false;
let isGG = false;
let showInstruction = false;
let showLeaderBoard = false;
let godMode = false;
let score = 0;
let name = '';
let panelRadius = 0;
let panelRaiudMax = canvas.height / 2 + 180;

let scoreRecords = JSON.parse(localStorage.getItem('leaderboard'));
if (!scoreRecords) {
    localStorage.setItem('leaderboard', JSON.stringify([]));
    scoreRecords = [];
}

let latestPlayer = localStorage.getItem('latestPlayer');
if (!latestPlayer) {
    latestPlayer = '';
}

//////////////////////////////////////////////////////////////////////////////// initialize background texture

context.fillStyle = 'rgba(0, 22, 52, 1)';
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = 'rgba(255, 255, 255, 0.02)';
context.shadowColor = 'white';
context.shadowBlur = 15;
for (let i = 0; i < 5000; i++) {
    let radius = randomBetween(1, 15);
    let x = randomBetween(0, canvas.width);
    let y = randomBetween(0, canvas.height);
    context.beginPath();
    context.arc(x, y, radius, Math.PI * 2, false);
    context.fill();
}
context.shadowBlur = 0;
let backgroundImageData = context.getImageData(0, 0, canvas.width, canvas.height);

//////////////////////////////////////////////////////////////////////////////// support functions

function reInitialize() {
    particlesCount = getParticleCount();
    isPlaying = false;
    isGG = false;
    showInstruction = false;
    showLeaderBoard = false;
    panelRadius = 0;
    score = 0;
    particles = [];
    for (let i = 0; i < particlesCount; i++) particles.push(new Particle());
    player.life = 3;
    player.beams = 3;
    name = '';
};

function getParticleCount() {
    return (canvas.width + canvas.height) / 12;
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

function getHypothenuse(x1, y1, x2, y2) {
    let x = Math.abs(x1 - x2);
    let y = Math.abs(y1 - y2);
    return Math.sqrt((x * x) + (y * y));
};

function saveGameRecord() {
    if (score > 0) {
        scoreRecords.unshift({name, score});
        scoreRecords.sort((a, b) => a.score > b.score ? -1 : 1);
        scoreRecords = scoreRecords.splice(0, 20);
        localStorage.setItem('leaderboard', JSON.stringify(scoreRecords));
        scoreRecords = JSON.parse(localStorage.getItem('leaderboard'));
        localStorage.setItem('latestPlayer', name);
        latestPlayer = localStorage.getItem('latestPlayer');
    }
};

function getHighScorer() {
    scoreRecords.sort((a, b) => a.score > b.score ? -1 : 1);
    return scoreRecords.length ? scoreRecords[0] : {name: '', score: 0};
};

//////////////////////////////////////////////////////////////////////////////// draw functions

function clearCanvas() {
    // context.fillStyle = 'rgba(0, 22, 52, 0.8)';
    // context.fillRect(0, 0, canvas.width, canvas.height);
    context.putImageData(backgroundImageData, 0, 0); // draw image data
    drawRandomParticles();
};

function drawRandomParticles() {
    context.fillStyle = 'rgba(255, 255, 255, 0.02)';
    context.shadowColor = 'white';
    context.shadowBlur = 15;
    for (let i = 0; i < 100; i++) {
        let x = randomBetween(0, canvas.width);
        let y = randomBetween(0, canvas.height);
        context.beginPath();
        context.arc(x, y, randomBetween(5, 10), Math.PI * 2, false);
        context.fill();
    }
    context.shadowBlur = 0;
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
            if (hyp < dist && hyp > 10) {
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

function drawTitle() {
    let x = playButton.x + playButton.radius + 25;
    let y = playButton.y;
    let size = 23;
    let spacing = 10;

    context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.fillStyle = 'white';
    if (playButton.isHit()) {
        context.shadowColor = 'white';
        context.shadowBlur = 15;
        context.lineWidth = 3;
    }

    context.beginPath(); // E
    context.moveTo(x, y);
    context.lineTo(x + size, y);
    context.lineTo(x + size, y - size / 2);
    context.lineTo(x, y - size / 2);
    context.lineTo(x, y + size / 2);
    context.lineTo(x + size + 1, y + size / 2);
    context.stroke();

    context.beginPath(); // N
    context.moveTo(x + size + spacing, y + size / 2 + 1);
    context.lineTo(x + size + spacing, y - size / 2);
    context.lineTo(x + size + spacing + size, y - size / 2);
    context.lineTo(x + size + spacing + size, y + size / 2 + 1);
    context.stroke();

    context.beginPath(); // T
    context.moveTo(x + size * 2 + spacing * 2, y - size / 2);
    context.lineTo(x + size * 2 + spacing * 2 + size + 1, y - size / 2);
    context.moveTo(x + size * 2 + spacing * 2 + size / 2, y - size / 2);
    context.lineTo(x + size * 2 + spacing * 2 + size / 2, y + size / 2 + 1);
    context.stroke();

    context.beginPath(); // A
    context.moveTo(x + size * 3 + spacing * 3 - 1, y - size / 2);
    context.lineTo(x + size * 3 + spacing * 3 + size, y - size / 2);
    context.lineTo(x + size * 3 + spacing * 3 + size, y + size / 2);
    context.lineTo(x + size * 3 + spacing * 3, y + size / 2);
    context.lineTo(x + size * 3 + spacing * 3, y);
    context.lineTo(x + size * 3 + spacing * 3 + size, y);
    context.stroke();

    context.beginPath(); // N
    context.moveTo(x + size * 4 + spacing * 4, y + size / 2 + 1);
    context.lineTo(x + size * 4 + spacing * 4, y - size / 2);
    context.lineTo(x + size * 4 + spacing * 4 + size, y - size / 2);
    context.lineTo(x + size * 4 + spacing * 4 + size, y + size / 2 + 1);
    context.stroke();

    context.beginPath(); // G
    context.arc(x + size * 5 + spacing * 5 + size / 2, y, size / 2 + 2, Math.PI * 2, false);
    context.stroke();
    context.beginPath();
    context.arc(x + size * 5 + spacing * 5 + size / 2 - 5, y + size - 8, 7, Math.PI * 2 + 1.8, false - 2.2);
    context.stroke();
    context.beginPath();
    context.ellipse(x + size * 5 + spacing * 5 + size / 2, y + 34, size - 10, size - 5, Math.PI / 2.3, Math.PI * 2, false);
    context.stroke();
    context.beginPath();
    context.moveTo(x + size * 5 + spacing * 5 + size + 5, y - size / 2 - 1 - 5);
    context.lineTo(x + size * 5 + spacing * 5 + size - 3, y - size / 2 + 3);
    context.stroke();

    context.beginPath(); // L
    context.moveTo(x + size * 6 + spacing * 6, y - size / 2 - 1);
    context.lineTo(x + size * 6 + spacing * 6, y + size / 2);
    context.lineTo(x + size * 6 + spacing * 6 + size + 1, y + size / 2);
    context.stroke();

    context.beginPath(); // E
    context.moveTo(x + size * 7 + spacing * 7, y);
    context.lineTo(x + size * 7 + spacing * 7 + size, y);
    context.lineTo(x + size * 7 + spacing * 7 + size, y - size / 2);
    context.lineTo(x + size * 7 + spacing * 7, y - size / 2);
    context.lineTo(x + size * 7 + spacing * 7, y + size / 2);
    context.lineTo(x + size * 7 + spacing * 7 + size + 1, y + size / 2);
    context.stroke();

    context.beginPath(); // D
    context.moveTo(x + size * 8 + spacing * 8 - 1, y - size / 2);
    context.lineTo(x + size * 8 + spacing * 8 + size / 2 + 5, y - size / 2);
    context.lineTo(x + size * 8 + spacing * 8 + size, y);
    context.lineTo(x + size * 8 + spacing * 8 + size / 2 + 5, y + size / 2);
    context.lineTo(x + size * 8 + spacing * 8, y + size / 2);
    context.lineTo(x + size * 8 + spacing * 8, y - size / 2);
    context.stroke();

    context.shadowBlur = 0;
    context.lineWidth = 1;
};

function drawPanel() {
    context.shadowColor = 'white';
    context.shadowBlur = 15;
    context.fillStyle = 'rgba(10, 32, 62, 1)';
    context.beginPath();
    context.arc(100, canvas.height / 2, panelRadius, Math.PI * 2, false);
    context.fill();
    context.shadowBlur = 0;
};

function drawInstructions() {
    let story = [
        'Entangled',
        '',
        'There was once two quantumly entangled particles',
        'which can only get close to each other but may never meet',
        'as they are cosmically destined to stay away from each other.',
        '',
        'All the Quantum Universe\'s a stage,',
        'these two particles merely are players, but dance forever in unison.',
        '',
        'This is a story about our particle, forever seeking a way back to its unique partner.',
        '',
        'Our particle can seemingly sense its partner particle\'s relative space-time coordinate,',
        'however, its partner particle is always moving from one point in space to another,',
        'thus, making it more difficult for our particle to reunite with its partner particle.',
        '! The Quantum Beam points to your destined pair. Click to activate Quantum Beam :',
        '! You have a max quantum beam charge of 3',
        '',
        'Other particles effortlessly bond with others, but not our particle.',
        'Our particle\'s attributes are so unique, rare, and inharmonious',
        'to other particles\' vibrations, that just getting minimal contact with another particle',
        'could crush that particle to its most basic level before disappearing.',
        'Getting in contact with another particle could hurt both particles.',
        '! Avoid getting in contact with other particles.',
        '! Colliding with other particles will reduce your HP :',
        '',
        'Only one particle in existence can withstand and match our particle\'s',
        'unique vibration, our particle\'s destined pair.',
        'Our pair particle is strong enough to not get crushed',
        'when getting in contact with our particle,',
        'in fact, it even empowers our particle, recharging its energy, but by doing this,',
        'it reduces its energy to the level that it can\'t',
        'handle our particle\'s vibrations, our pair particle should relocate.',
        'It knows that staying won\'t do any good. It must... move away. To restore its ',
        'energy levels and regain its original vibration. Until they meet again.',
        '! Getting in contact with you pair particle increases your score and recharges',
        '! your quantum beam charge to 3, then teleports to another location'
    ];

    let x = 50;
    let y = canvas.height / 2;
    for (let i = 0; i < story.length; i++) {
        let text = story[i];
        let fontSize = 14;
        let spacing = 8;
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.font = `bold ${fontSize}px Arial`;
        if (text == 'Entangled') {
            context.font = `bold 30px Arial`;
        } else if (text[0] == '!') {
            context.fillStyle = 'rgba(225, 225, 255, 0.3)';
        }
        let tempY = y + (fontSize * (i - story.length / 2) + (spacing * (i - story.length / 2)));
        context.fillText(text, x, tempY);
        if (text.indexOf('HP') > -1) {
            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.arc(x + context.measureText(text).width + 21, tempY + 2, 5, Math.PI * 2, false);
            context.fill();
            context.beginPath();
            context.arc(x + context.measureText(text).width + 13, tempY - 6, 5, Math.PI * 2, false);
            context.fill();
            context.beginPath();
            context.arc(x + context.measureText(text).width + 28, tempY - 6, 5, Math.PI * 2, false);
            context.fill();
        } else if (text.indexOf('Click') > -1) {
            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.arc(x + context.measureText(text).width + 17, tempY, 10, Math.PI * 2, false);
            context.fill();
            context.fillStyle = 'rgba(0, 22, 52, 1)';
            context.beginPath();
            context.arc(x + context.measureText(text).width + 17, tempY, 5, Math.PI * 2, false);
            context.fill();
        }
    }
};

function drawLeaderboard() {
    let x = 350;
    let y = canvas.height / 2;
    if (!scoreRecords.length) {
        let logoX = x - 50; // draw trophy
        let logoY = y;
        context.shadowColor = 'white';
        context.shadowBlur = 15;
        context.lineWidth = 5;
        context.strokeStyle = `rgba(255, 255 ,255 , 1)`;
        context.fillStyle = '#001634';
        context.beginPath();
        context.arc(logoX, logoY, 30, Math.PI * 2, false);
        context.stroke();
        context.shadowBlur = 0;
        context.lineWidth = 1;
        context.strokeRect(logoX - 6 , logoY + 12, 12, 1);
        context.strokeRect(logoX - 1 , logoY + 4 , 2 , 8);
        context.strokeRect(logoX - 5 , logoY + 2 , 10, 1);
        context.strokeRect(logoX - 7 , logoY - 1 , 14, 1);
        context.strokeRect(logoX - 9 , logoY - 8 , 18, 5);
        context.strokeRect(logoX - 7 , logoY - 10, 14, 2);
        context.strokeRect(logoX - 9 , logoY - 14, 18, 3);
        context.beginPath();
        context.arc(logoX - 11, logoY - 6, 4, Math.PI * 2, false);
        context.stroke();
        context.beginPath();
        context.arc(logoX + 11, logoY - 6, 4, Math.PI * 2, false);
        context.stroke();
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.textBaseline = 'middle';
        context.textAlign = 'left';
        context.font = `20px Arial`;
        context.fillText('No scores yet...', x, y);
        return;
    }
    for (let i = 0; i < scoreRecords.length; i++) {
        let scoreRecord = scoreRecords[i];
        let fontSize = 12;
        let spacing = 8;
        let tempFontSize = fontSize;
        if (i == 0) {
            tempFontSize = 25;
            spacing = 15;
        } else if (i == 1) {
            tempFontSize = 18;
            spacing = 12;
        } else if (i == 2) {
            tempFontSize = 18;
            spacing = 12;
        }
        context.font = `${i < 3 ? 'bold' : ''} ${tempFontSize}px Arial`;
        if (i == 0) { // draw crown
            let logoX = x + context.measureText(scoreRecord.score).width + 30;
            let logoY = y + (fontSize * (i - scoreRecords.length / 2) + (spacing * (i - scoreRecords.length / 2))) - 3;
            context.shadowColor = 'white';
            context.shadowBlur = 15;
            context.lineWidth = 2;
            context.strokeStyle = `rgba(255, 255 ,255 , 1)`;
            context.fillStyle = '#001634';
            context.beginPath();
            context.arc(logoX, logoY, 16, Math.PI * 2, false);
            context.stroke();
            context.shadowBlur = 0;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(logoX - 7, logoY + 8);
            context.lineTo(logoX - 9, logoY - 6);
            context.lineTo(logoX - 4, logoY - 0);
            context.lineTo(logoX - 0, logoY - 6);
            context.lineTo(logoX + 4, logoY - 0);
            context.lineTo(logoX + 9, logoY - 6);
            context.lineTo(logoX + 7, logoY + 8);
            context.lineTo(logoX - 7, logoY + 8);
            context.moveTo(logoX - 7, logoY + 5);
            context.lineTo(logoX + 7, logoY + 5);
            context.stroke();
        }

        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.textBaseline = i < 3 ? 'middle' : 'top';
        context.textAlign = 'right';
        context.fillText(scoreRecord.name + ' : ', x, y + (fontSize * (i - scoreRecords.length / 2) + (spacing * (i - scoreRecords.length / 2))));
        context.textAlign = 'left';
        context.fillText(scoreRecord.score, x, y + (fontSize * (i - scoreRecords.length / 2) + (spacing * (i - scoreRecords.length / 2))));
    }
};

function drawHearts() {
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Health:', 65, 18);
    for (let i = 1; i <= player.life; i++) {
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
};

function drawBeams() {
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Beams:', 230, 18);
    for (let i = 1; i <= player.beams; i++) {
        let x = (border * i) / 1.5 + 240;
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.beginPath();
        context.arc(x, 17, 10, Math.PI * 2, false);
        context.fill();
        context.fillStyle = 'rgba(0, 22, 52, 1)';
        context.beginPath();
        context.arc(x, 17, 5, Math.PI * 2, false);
        context.fill();
    }
};

function drawScore() {
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.font = '12px Arial';
    context.fillText('Score:', 375, 18);
    context.font = 'bold 20px Arial';
    context.fillText(score, 420, 18);
};

function drawGG() {
    context.shadowBlur = 15;
    context.fillStyle = 'rgba(10, 32, 62, 1)';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 300, Math.PI * 2 , false);
    context.fill();
    context.shadowBlur = 0;

    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = 'bold 70px Arial';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 70);
    context.textAlign = 'center';
    context.font = '30px Arial';
    context.fillText('Your Score : ' + score, canvas.width / 2, canvas.height / 2 + 20);
    context.font = '20px Arial';
    context.fillText(score > getHighScorer().score ? 'New High Score!!!' : 'Highest Score : ' + getHighScorer().score, canvas.width / 2, canvas.height / 2 + 60);
    context.font = '30px Arial';
    context.fillText((!name ? 'Your Name : _' : 'Your Name : ') + name, canvas.width / 2, canvas.height / 2 + 130);
    if (name.length) {
        context.font = '12px Arial';
        context.fillText('Back', goal.x, goal.y + goal.radius + 10);
    }
};

//////////////////////////////////////////////////////////////////////////////// main loop

function render() {
    clearCanvas();

    if (isGG) {
        drawGG();
    } else if (!isPlaying) {
        drawTitle();
        playButton.update().draw();
        instructionButton.update().draw();
        leaderButton.update().draw();
        randButton.update().draw();
        if ((showInstruction || showLeaderBoard) && panelRadius < canvas.height / 2 + 150) { // panel circle logic
            panelRadius += (panelRaiudMax) / 10;
            if (panelRadius >= panelRaiudMax) {
                panelRadius = panelRaiudMax;
            }
        } else if (!showInstruction && !showLeaderBoard && panelRadius > 0) {
            panelRadius -= (panelRaiudMax) / 10;
            if (panelRadius <= 0) {
                panelRadius = 0;
            }
        }
        drawPanel();
        if (showInstruction && panelRadius == panelRaiudMax) {
            drawInstructions();
        } else if (showLeaderBoard && panelRadius == panelRaiudMax) {
            drawLeaderboard();
        }
    } else {
        for (let particle of particles) { // draw particles
            particle.update().draw();
        }
        drawBorders();
        drawParticleConnectionLines();
        drawHearts();
        drawBeams();
        drawScore();
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
    this.hitOpacity = 0;
    this.goalOpacity = 0;
    this.update = function() {
        this.hitOpacity -= this.hitOpacity > 0 ? 0.015 : 0;
        this.goalOpacity -= this.goalOpacity > 0 ? 0.015 : 0;
        this.x += (this.destinationX - this.x) / 2;
        this.y += (this.destinationY - this.y) / 2;
        for (let i = 0; i < particles.length; i++) {
            if (!godMode && isPlaying && getHypothenuse(this.x, this.y, particles[i].x, particles[i].y) < this.radius + particles[i].radius) {
                this.life--;
                particles.splice(i, 1);
                this.hitOpacity = 0.5;
            }
        }
        this.auraOpacity -= 0.02;
        return this;
    };
    this.draw = function() {
        context.fillStyle = `rgba(200, 20, 20, ${this.hitOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = `rgba(200, 200, 200, ${this.goalOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.shadowColor = 'white';
        context.shadowBlur = this.auraOpacity > 0 ? 100 * this.auraOpacity : 0;
        context.fillStyle = `rgba(255, 255, 255, ${this.auraOpacity > 0 ? 1 : 0.5})`;
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
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
        if (this.x < canvas.width / 2) {
            this.x = randomBetween(canvas.width / 2, canvas.width - border);
        } else {
            this.x = randomBetween(border, canvas.width / 2);
        }
        this.y = randomBetween(border, canvas.height - border);
        if (isPlaying) {
            score++;
            player.beams = 3;
            player.goalOpacity = 0.5;
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
    const originalX = this.x;
    this.y = y;
    this.radius = r;
    this.type = type;
    this.isHit = function() {
        if (this.type == 'play' && (showInstruction || showLeaderBoard)) {
            return false;
        }
        return getHypothenuse(this.x, this.y, player.x, player.y) < this.radius;
    };
    this.isLight = function() {
        if (this.type == 'instruction' && showInstruction) {
            return true;
        } else if (this.type == 'leader' && showLeaderBoard) {
            return true;
        }
        return false;
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
            context.fillText('?', this.x, this.y - 2);
            context.strokeText('?', this.x, this.y - 2);
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('?', this.x + 12, this.y + 6);
            context.strokeText('?', this.x + 12, this.y + 6);
            context.fillText('?', this.x - 12, this.y + 6);
            context.strokeText('?', this.x - 12, this.y + 6);
        } else if (this.type == 'leader') {
            context.fillRect(this.x - 6 , this.y + 12, 12, 1);
            context.fillRect(this.x - 1 , this.y + 4 , 2 , 8);
            context.fillRect(this.x - 5 , this.y + 2 , 10, 1);
            context.fillRect(this.x - 7 , this.y - 1 , 14, 1);
            context.fillRect(this.x - 9 , this.y - 8 , 18, 5);
            context.fillRect(this.x - 7 , this.y - 10, 14, 2);
            context.fillRect(this.x - 9 , this.y - 14, 18, 3);
            context.strokeRect(this.x - 6 , this.y + 12, 12, 1);
            context.strokeRect(this.x - 1 , this.y + 4 , 2 , 8);
            context.strokeRect(this.x - 5 , this.y + 2 , 10, 1);
            context.strokeRect(this.x - 7 , this.y - 1 , 14, 1);
            context.strokeRect(this.x - 9 , this.y - 8 , 18, 5);
            context.strokeRect(this.x - 7 , this.y - 10, 14, 2);
            context.strokeRect(this.x - 9 , this.y - 14, 18, 3);
            context.beginPath();
            context.arc(this.x - 11, this.y - 6, 4, Math.PI * 2, false);
            context.stroke();
            context.beginPath();
            context.arc(this.x + 11, this.y - 6, 4, Math.PI * 2, false);
            context.stroke();
        }
    };
    this.update = function() {
        this.x = originalX + panelRadius;
        return this;
    }
    this.draw = function() {
        context.shadowColor = 'white';
        context.shadowBlur = this.isHit() || this.isLight() ? 15 : 0;
        context.lineWidth = this.isHit() || this.isLight() ? 10 : 3;
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
    if (!isPlaying)
        if (instructionButton.isHit()) {
            showLeaderBoard = false;
            showInstruction = !showInstruction;
            return;
        }
        if (leaderButton.isHit()) {
            showInstruction = false;
            showLeaderBoard = !showLeaderBoard;
            return;
        }
        if (playButton.isHit()) {
            isPlaying = true;
            goal.x = canvas.width - 200;
            goal.y = canvas.height / 2;
            name = latestPlayer;
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
        if (isPlaying) {
            godMode = true;
        } else {
            showInstruction = false;
            showLeaderBoard = false;
        }
    }
});

window.addEventListener('keyup', function(e) {
    godMode = false;
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = 200;
    player.y = canvas.height / 2;
    goal.x = canvas.width - 200;
    goal.y = canvas.height / 2;
    playButton = new Button(280, canvas.height / 2, 50, 'play');
    instructionButton = new Button(280 - 67, canvas.height / 2 - 67, 30, 'instruction');
    leaderButton = new Button(280 + 67, canvas.height / 2 + 67, 30, 'leader');
    randButton = new Button(200, canvas.height / 2, 15, 'random');
    reInitialize();
});

////////////////////////////////////////////////////////////////////////////////
