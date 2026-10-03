import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


/* =========================================
   SCENE
========================================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x9aa4ad);

scene.fog =
    new THREE.Fog(
        0x9aa4ad,
        35,
        140
    );


/* =========================================
   CAMERA
========================================= */

const camera =
    new THREE.PerspectiveCamera(
        78,
        window.innerWidth /
        window.innerHeight,
        0.1,
        300
    );


/* =========================================
   RENDERER
========================================= */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


/* =========================================
   LIGHTING
========================================= */

const hemi =
    new THREE.HemisphereLight(
        0xeaf4ff,
        0x20242a,
        2.2
    );

scene.add(hemi);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3.5
    );

sun.position.set(
    -30,
    60,
    25
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;

scene.add(sun);


/* =========================================
   WORLD
========================================= */

const platforms = [];


function createPlatform(
    x,
    y,
    z,
    width,
    height,
    depth,
    color = 0x20262d
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.7,
            metalness: 0.25
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    platforms.push({
        mesh,

        x,
        y,
        z,

        width,
        height,
        depth
    });

    return mesh;
}


/* =========================================
   PARKOUR COURSE
========================================= */

/* START */

createPlatform(
    0,
    -1,
    0,
    14,
    2,
    14,
    0x293139
);


/* JUMPS */

createPlatform(
    0,
    0,
    -11,
    6,
    2,
    6,
    0x343c44
);

createPlatform(
    7,
    1.5,
    -19,
    5,
    2,
    5,
    0x343c44
);

createPlatform(
    -1,
    3,
    -27,
    5,
    2,
    5,
    0x343c44
);

createPlatform(
    -9,
    5,
    -35,
    5,
    2,
    5,
    0x343c44
);

createPlatform(
    0,
    7,
    -43,
    6,
    2,
    6,
    0x343c44
);

createPlatform(
    9,
    9,
    -51,
    6,
    2,
    6,
    0x343c44
);


/* =========================================
   ACCENT STRIPS
========================================= */

function createAccent(
    x,
    y,
    z,
    w,
    d
) {

    const geometry =
        new THREE.BoxGeometry(
            w,
            0.08,
            d
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x8cff00,
            emissive: 0x315f00,
            emissiveIntensity: 1.5
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    scene.add(mesh);
}


/* Platform details */

createAccent(0, 0.04, -11, 4, 0.12);
createAccent(7, 1.54, -19, 3, 0.12);
createAccent(-1, 3.04, -27, 3, 0.12);
createAccent(-9, 5.04, -35, 3, 0.12);
createAccent(0, 7.04, -43, 4, 0.12);
createAccent(9, 9.04, -51, 4, 0.12);


/* =========================================
   CHECKPOINTS
========================================= */

const checkpoints = [

    {
        position:
            new THREE.Vector3(
                0,
                2,
                -11
            ),
        name: "01"
    },

    {
        position:
            new THREE.Vector3(
                7,
                3.5,
                -19
            ),
        name: "02"
    },

    {
        position:
            new THREE.Vector3(
                -1,
                5,
                -27
            ),
        name: "03"
    },

    {
        position:
            new THREE.Vector3(
                -9,
                7,
                -35
            ),
        name: "04"
    },

    {
        position:
            new THREE.Vector3(
                0,
                9,
                -43
            ),
        name: "05"
    }
];


let checkpointIndex = -1;


/* =========================================
   FINISH
========================================= */

const finishGeometry =
    new THREE.BoxGeometry(
        5,
        5,
        0.4
    );

const finishMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8cff00,
        emissive: 0x4d8f00,
        emissiveIntensity: 2
    });

const finish =
    new THREE.Mesh(
        finishGeometry,
        finishMaterial
    );

finish.position.set(
    9,
    12,
    -51
);

scene.add(finish);


/* =========================================
   PLAYER
========================================= */

const player = {

    position:
        new THREE.Vector3(
            0,
            2,
            3
        ),

    velocity:
        new THREE.Vector3(),

    height: 1.75,

    walkSpeed: 7,

    sprintSpeed: 12,

    jumpPower: 9,

    gravity: 25,

    grounded: false
};


/* =========================================
   INPUT
========================================= */

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        if (
            event.code === "Space" &&
            player.grounded &&
            gameRunning
        ) {

            player.velocity.y =
                player.jumpPower;

            player.grounded = false;
        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


/* =========================================
   CAMERA LOOK
========================================= */

let yaw = 0;
let pitch = 0;


document.addEventListener(
    "mousemove",
    event => {

        if (
            !gameRunning ||
            document.pointerLockElement !==
            renderer.domElement
        ) {
            return;
        }

        yaw -=
            event.movementX * 0.0022;

        pitch -=
            event.movementY * 0.0022;

        pitch =
            Math.max(
                -1.45,
                Math.min(
                    1.45,
                    pitch
                )
            );

    }
);


/* =========================================
   GROUND COLLISION
========================================= */

function updateGround() {

    player.grounded = false;

    const feet =
        player.position.y -
        player.height;


    for (
        const platform of platforms
    ) {

        const halfX =
            platform.width / 2;

        const halfZ =
            platform.depth / 2;

        const insideX =
            player.position.x >
                platform.x - halfX &&
            player.position.x <
                platform.x + halfX;

        const insideZ =
            player.position.z >
                platform.z - halfZ &&
            player.position.z <
                platform.z + halfZ;

        const top =
            platform.y +
            platform.height / 2;


        if (
            insideX &&
            insideZ &&
            feet <= top + 0.15 &&
            feet >= top - 1.5 &&
            player.velocity.y <= 0
        ) {

            player.position.y =
                top +
                player.height;

            player.velocity.y = 0;

            player.grounded = true;

        }

    }

}


/* =========================================
   CHECKPOINT SYSTEM
========================================= */

function updateCheckpoints() {

    for (
        let i = 0;
        i < checkpoints.length;
        i++
    ) {

        if (
            i <= checkpointIndex
        ) continue;


        const distance =
            player.position.distanceTo(
                checkpoints[i].position
            );


        if (distance < 4) {

            checkpointIndex = i;

            document
                .getElementById(
                    "checkpointNumber"
                )
                .textContent =
                checkpoints[i].name;

        }

    }

}


/* =========================================
   RESET TO CHECKPOINT
========================================= */

function resetToCheckpoint() {

    if (checkpointIndex < 0) {

        player.position.set(
            0,
            2,
            3
        );

    } else {

        const checkpoint =
            checkpoints[
                checkpointIndex
            ];

        player.position.copy(
            checkpoint.position
        );

    }

    player.velocity.set(
        0,
        0,
        0
    );

}


/* =========================================
   FINISH CHECK
========================================= */

function checkFinish() {

    const distance =
        player.position.distanceTo(
            finish.position
        );


    if (
        distance < 5 &&
        !levelComplete
    ) {

        finishLevel();

    }

}


/* =========================================
   TIMER
========================================= */

let startTime = 0;


function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        secs.toFixed(2)
            .padStart(5, "0")
    );

}


/* =========================================
   GAME STATE
========================================= */

let gameRunning = false;
let levelComplete = false;


function startGame() {

    gameRunning = true;
    levelComplete = false;

    checkpointIndex = -1;

    document
        .getElementById(
            "checkpointNumber"
        )
        .textContent = "START";

    document
        .getElementById(
            "menu"
        )
        .style.display = "none";

    document
        .getElementById(
            "complete"
        )
        .style.display = "none";

    document
        .getElementById(
            "hud"
        )
        .style.display = "block";


    player.position.set(
        0,
        2,
        3
    );

    player.velocity.set(
        0,
        0,
        0
    );


    yaw = 0;
    pitch = 0;

    startTime =
        performance.now();


    renderer.domElement.requestPointerLock();

}


function finishLevel() {

    gameRunning = false;
    levelComplete = true;

    const time =
        (
            performance.now() -
            startTime
        ) / 1000;


    const formatted =
        formatTime(time);


    let best =
        Number(
            localStorage.getItem(
                "parkour_best"
            )
        );


    if (
        !best ||
        time < best
    ) {

        best = time;

        localStorage.setItem(
            "parkour_best",
            String(best)
        );

    }


    document
        .getElementById(
            "finalTime"
        )
        .textContent =
        formatted;


    document
        .getElementById(
            "completeBest"
        )
        .textContent =
        formatTime(best);


    document
        .getElementById(
            "bestTime"
        )
        .textContent =
        formatTime(best);


    document
        .getElementById(
            "hud"
        )
        .style.display = "none";


    document
        .getElementById(
            "complete"
        )
        .style.display = "flex";


    document.exitPointerLock();

}


/* =========================================
   BUTTONS
========================================= */

document
    .getElementById(
        "playButton"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "againButton"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "menuButton"
    )
    .addEventListener(
        "click",
        () => {

            gameRunning = false;

            document
                .getElementById(
                    "complete"
                )
                .style.display = "none";

            document
                .getElementById(
                    "hud"
                )
                .style.display = "none";

            document
                .getElementById(
                    "menu"
                )
                .style.display = "flex";

        }
    );


/* =========================================
   GAME LOOP
========================================= */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (
        gameRunning &&
        !levelComplete
    ) {


        /* MOVEMENT */

        const direction =
            new THREE.Vector3();


        if (
            keys["KeyW"]
        ) {
            direction.z -= 1;
        }

        if (
            keys["KeyS"]
        ) {
            direction.z += 1;
        }

        if (
            keys["KeyA"]
        ) {
            direction.x -= 1;
        }

        if (
            keys["KeyD"]
        ) {
            direction.x += 1;
        }


        if (
            direction.lengthSq() > 0
        ) {

            direction.normalize();

            direction.applyAxisAngle(
                new THREE.Vector3(
                    0,
                    1,
                    0
                ),
                yaw
            );


            const sprinting =
                keys["ShiftLeft"] ||
                keys["ShiftRight"];


            const speed =
                sprinting
                    ? player.sprintSpeed
                    : player.walkSpeed;


            player.position.x +=
                direction.x *
                speed *
                delta;


            player.position.z +=
                direction.z *
                speed *
                delta;

        }


        /* GRAVITY */

        player.velocity.y -=
            player.gravity *
            delta;


        player.position.y +=
            player.velocity.y *
            delta;


        updateGround();


        /* FALL */

        if (
            player.position.y < -20
        ) {

            resetToCheckpoint();

        }


        updateCheckpoints();

        checkFinish();


        /* CAMERA */

        camera.position.copy(
            player.position
        );

        camera.rotation.order =
            "YXZ";

        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;


        /* TIMER */

        const elapsed =
            (
                performance.now() -
                startTime
            ) / 1000;


        document
            .getElementById(
                "timer"
            )
            .textContent =
            formatTime(elapsed);

    }


    renderer.render(
        scene,
        camera
    );

}


animate();


/* =========================================
   RESIZE
========================================= */

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
