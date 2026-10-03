import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================
   BASIC SETUP
========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 35, 120);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);


/* =========================
   LIGHTING
========================= */

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(20, 40, 20);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);


/* =========================
   WORLD
========================= */

const blocks = [];

function createBlock(x, y, z, width, height, depth, color = 0x4caf50) {

    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const material = new THREE.MeshStandardMaterial({
        color
    });

    const block = new THREE.Mesh(
        geometry,
        material
    );

    block.position.set(x, y, z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);

    blocks.push({
        mesh: block,
        x,
        y,
        z,
        width,
        height,
        depth
    });

    return block;
}


/* =========================
   PARKOUR MAP
========================= */

// Starting platform
createBlock(0, -1, 0, 12, 2, 12, 0x3f8f4f);

// Platforms
createBlock(0, 0, -10, 5, 2, 5, 0x4caf50);
createBlock(7, 2, -17, 5, 2, 5, 0x3498db);
createBlock(-1, 4, -25, 5, 2, 5, 0xe67e22);
createBlock(-9, 6, -32, 5, 2, 5, 0x9b59b6);
createBlock(0, 8, -40, 6, 2, 6, 0x2ecc71);

// Final platform
createBlock(10, 10, -49, 8, 2, 8, 0xf1c40f);


/* =========================
   FINISH
========================= */

const finishGeometry = new THREE.BoxGeometry(
    4,
    5,
    0.5
);

const finishMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x222222
});

const finish = new THREE.Mesh(
    finishGeometry,
    finishMaterial
);

finish.position.set(10, 13, -49);

scene.add(finish);


/* =========================
   PLAYER
========================= */

const player = {
    position: new THREE.Vector3(0, 2, 3),

    velocity: new THREE.Vector3(),

    height: 1.7,

    speed: 7,
    jump: 8,

    onGround: false
};

camera.position.copy(player.position);


/* =========================
   INPUT
========================= */

const keys = {};

document.addEventListener("keydown", (event) => {

    keys[event.code] = true;

    if (
        event.code === "Space" &&
        player.onGround
    ) {

        player.velocity.y = player.jump;
        player.onGround = false;
    }

});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});


/* =========================
   MOUSE LOOK
========================= */

let yaw = 0;
let pitch = 0;

let gameStarted = false;

document.addEventListener("mousemove", (event) => {

    if (!gameStarted) return;

    if (document.pointerLockElement !== renderer.domElement) {
        return;
    }

    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;

    pitch = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, pitch)
    );

});


/* =========================
   COLLISION
========================= */

function checkGround() {

    player.onGround = false;

    const playerX = player.position.x;
    const playerZ = player.position.z;

    const feet = player.position.y - player.height;

    for (const block of blocks) {

        const halfX = block.width / 2;
        const halfZ = block.depth / 2;

        const insideX =
            playerX > block.x - halfX &&
            playerX < block.x + halfX;

        const insideZ =
            playerZ > block.z - halfZ &&
            playerZ < block.z + halfZ;

        const top = block.y + block.height / 2;

        if (
            insideX &&
            insideZ &&
            feet <= top + 0.2 &&
            feet >= top - 1
        ) {

            player.position.y =
                top + player.height;

            player.velocity.y = 0;

            player.onGround = true;

            break;
        }
    }
}


/* =========================
   RESET
========================= */

function resetPlayer() {

    player.position.set(
        0,
        2,
        3
    );

    player.velocity.set(0, 0, 0);

    yaw = 0;
    pitch = 0;
}


/* =========================
   GAME STATE
========================= */

let startTime = 0;
let finished = false;

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const winScreen = document.getElementById("winScreen");

const timerElement =
    document.getElementById("timer");

const finalTime =
    document.getElementById("finalTime");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");


function startGame() {

    gameStarted = true;
    finished = false;

    menu.style.display = "none";
    winScreen.style.display = "none";
    hud.style.display = "block";

    resetPlayer();

    startTime = performance.now();

    renderer.domElement.requestPointerLock();
}


startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


/* =========================
   FINISH CHECK
========================= */

function checkFinish() {

    const distance =
        player.position.distanceTo(
            finish.position
        );

    if (
        distance < 5 &&
        !finished
    ) {

        finished = true;
        gameStarted = false;

        const time =
            (performance.now() - startTime) / 1000;

        finalTime.textContent =
            time.toFixed(2) + " s";

        winScreen.style.display = "flex";
        hud.style.display = "none";

        document.exitPointerLock();
    }
}


/* =========================
   FALL RESET
========================= */

function checkFall() {

    if (player.position.y < -15) {

        resetPlayer();

    }
}


/* =========================
   GAME LOOP
========================= */

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta =
        Math.min(clock.getDelta(), 0.05);

    if (gameStarted && !finished) {

        /* Movement */

        const direction =
            new THREE.Vector3();

        if (keys["KeyW"]) {
            direction.z -= 1;
        }

        if (keys["KeyS"]) {
            direction.z += 1;
        }

        if (keys["KeyA"]) {
            direction.x -= 1;
        }

        if (keys["KeyD"]) {
            direction.x += 1;
        }

        if (direction.length() > 0) {

            direction.normalize();

            direction.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                yaw
            );

            player.position.x +=
                direction.x *
                player.speed *
                delta;

            player.position.z +=
                direction.z *
                player.speed *
                delta;
        }


        /* Gravity */

        player.velocity.y -=
            20 * delta;

        player.position.y +=
            player.velocity.y *
            delta;


        checkGround();
        checkFall();
        checkFinish();


        /* Camera */

        camera.position.copy(
            player.position
        );

        camera.rotation.order = "YXZ";

        camera.rotation.y = yaw;
        camera.rotation.x = pitch;


        /* Timer */

        const elapsed =
            (performance.now() - startTime) / 1000;

        timerElement.textContent =
            elapsed.toFixed(2);
    }

    renderer.render(
        scene,
        camera
    );
}


/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


animate();
