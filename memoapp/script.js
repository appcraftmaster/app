const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.5;
const bounceFactor = 0.7;
let balls = [];
let selectedBall = null;
let offsetX = 0;
let offsetY = 0;

class Ball {
    constructor(x, y, radius, color, text) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.dy = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.font = `${this.radius / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        if (selectedBall !== this) {
            if (this.y + this.radius + this.dy > canvas.height) {
                this.dy = -this.dy * bounceFactor;
            } else {
                this.dy += gravity;
            }
            this.y += this.dy;
        }
        this.draw();
    }

    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}

function loadBallsFromCSV(data) {
    balls = [];
    data.forEach(row => {
        const x = parseFloat(row[0]);
        const y = parseFloat(row[1]);
        const radius = parseFloat(row[2]);
        const color = row[3];
        const text = row[4];
        balls.push(new Ball(x, y, radius, color, text));
    });
    animate();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                loadBallsFromCSV(results.data);
            }
        });
    }
}

function handleMouseDown(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    balls.forEach(ball => {
        if (ball.isPointInside(mouseX, mouseY)) {
            selectedBall = ball;
            offsetX = mouseX - ball.x;
            offsetY = mouseY - ball.y;
        }
    });
}

function handleMouseMove(event) {
    if (selectedBall) {
        selectedBall.x = event.clientX - offsetX;
        selectedBall.y = event.clientY - offsetY;
    }
}

function handleMouseUp() {
    selectedBall = null;
}

function handleTouchStart(event) {
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    balls.forEach(ball => {
        if (ball.isPointInside(touchX, touchY)) {
            selectedBall = ball;
            offsetX = touchX - ball.x;
            offsetY = touchY - ball.y;
        }
    });
}

function handleTouchMove(event) {
    if (selectedBall) {
        const touch = event.touches[0];
        selectedBall.x = touch.clientX - offsetX;
        selectedBall.y = touch.clientY - offsetY;
    }
}

function handleTouchEnd() {
    selectedBall = null;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => ball.update());
    requestAnimationFrame(animate);
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp); // Ensure ball deselects if mouse leaves the canvas

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
