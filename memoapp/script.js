const { Engine, Render, Runner, Bodies, World, Mouse, MouseConstraint, Events } = Matter;

const canvas = document.getElementById('simulationCanvas');
const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

let balls = [];

// Create walls
const walls = [
    Bodies.rectangle(window.innerWidth / 2, -25, window.innerWidth, 50, { isStatic: true }), // Top wall
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth, 50, { isStatic: true }), // Bottom wall
    Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }), // Left wall
    Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }) // Right wall
];

World.add(world, walls);

function loadBallsFromCSV(data) {
    balls.forEach(ball => World.remove(world, ball));
    balls = [];
    
    data.forEach(row => {
        const x = parseFloat(row[0]);
        const y = parseFloat(row[1]);
        const radius = parseFloat(row[2]);
        const color = row[3];
        const text = row[4];

        const ball = Bodies.circle(x, y, radius, {
            restitution: 0.7,
            render: {
                fillStyle: color,
                strokeStyle: 'black',
                lineWidth: 1
            },
            custom: {
                text: text,
                radius: radius
            }
        });

        World.add(world, ball);
        balls.push(ball);
    });
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

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);

    // Update wall positions and sizes
    World.remove(world, walls);
    walls[0] = Bodies.rectangle(window.innerWidth / 2, -25, window.innerWidth, 50, { isStatic: true }); // Top wall
    walls[1] = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth, 50, { isStatic: true }); // Bottom wall
    walls[2] = Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }); // Left wall
    walls[3] = Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }); // Right wall
    World.add(world, walls);
});

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

render.mouse = mouse;

// Custom rendering for text
Events.on(render, 'afterRender', function() {
    const context = render.context;
    balls.forEach(ball => {
        const text = ball.custom.text;
        const radius = ball.custom.radius;
        const x = ball.position.x;
        const y = ball.position.y;

        context.fillStyle = 'black';
        context.font = `${radius / 2}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x, y);
    });
});
