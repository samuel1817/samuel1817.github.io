```javascript
import * as THREE from "three";

/* =====================================================
   INFINITY SHOOTER
   Simple Three.js FPS
===================================================== */

let scene;
let camera;
let renderer;

let player;
let weapon;

let keys = {};

let yaw = 0;
let pitch = 0;

let isPlaying = false;
let isPaused = false;
let isReloading = false;

let health = 100;
let ammo = 30;
let reserveAmmo = 120;
let score = 0;

let enemies = [];
let bullets = [];

let lastTime = performance.now();
let lastShot = 0;

const raycaster = new THREE.Raycaster();

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const pauseScreen = document.getElementById("pauseScreen");
const gameOver = document.getElementById("gameOver");

const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtn = document.getElementById("menuBtn");
const restartBtn = document.getElementById("restartBtn");
const gameMenuBtn = document.getElementById("gameMenuBtn");

const healthFill = document.getElementById("healthFill");
const healthText = document.getElementById("healthText");
const ammoText = document.getElementById("ammo");
const scoreText = document.getElementById("score");
const enemyCount = document.getElementById("enemyCount");
const reloadText = document.getElementById("reloadText");
const finalScore = document.getElementById("finalScore");

/* =====================================================
   START
===================================================== */

init();
animate();

function init() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87a9c2);

    scene.fog = new THREE.Fog(0x87a9c2, 45, 150);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );

    camera.position.set(0, 1.7, 15);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    createLights();
    createWorld();
    createPlayer();
    createWeapon();
    createEnemies();

    updateHUD();

    window.addEventListener("resize", onResize);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);

    document.addEventListener("pointerlockchange", pointerLockChanged);

    startBtn.addEventListener("click", startGame);
    resumeBtn.addEventListener("click", resumeGame);
    restartBtn.addEventListener("click", restartGame);

    menuBtn.addEventListener("click", returnToMenu);
    gameMenuBtn.addEventListener("click", returnToMenu);
}

/* =====================================================
   LIGHTS
===================================================== */

function createLights() {

    const ambient = new THREE.HemisphereLight(
        0xffffff,
        0x52616b,
        2.0
    );

    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    sun.position.set(30, 60, 20);
    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;

    scene.add(sun);
}

/* =====================================================
   WORLD
===================================================== */

function createWorld() {

    // Grass
    const grassGeometry = new THREE.PlaneGeometry(180, 180);

    const grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x55754d,
        roughness: 1
    });

    const grass = new THREE.Mesh(
        grassGeometry,
        grassMaterial
    );

    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;

    scene.add(grass);

    // Main road
    createRoad(0, 0, 12, 180);
    createRoad(0, 0, 180, 12);

    // Fountain
    createFountain();

    // Houses
    createHouse(-35, -30);
    createHouse(35, -30);
    createHouse(-35, 30);
    createHouse(35, 30);

    createHouse(-55, 0);
    createHouse(55, 0);

    // Trees
    for (let i = 0; i < 35; i++) {

        const x = (Math.random() - 0.5) * 150;
        const z = (Math.random() - 0.5) * 150;

        if (Math.abs(x) < 15 || Math.abs(z) < 15) {
            continue;
        }

        createTree(x, z);
    }

    // Fences
    createFence(-22, -20, 25, 0);
    createFence(22, 20, 25, Math.PI);
}

/* =====================================================
   ROAD
===================================================== */

function createRoad(x, y, width, depth) {

    const geometry = new THREE.PlaneGeometry(width, depth);

    const material = new THREE.MeshStandardMaterial({
        color: 0x34383b,
        roughness: 1
    });

    const road = new THREE.Mesh(
        geometry,
        material
    );

    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, y);

    scene.add(road);
}

/* =====================================================
   HOUSE
===================================================== */

function createHouse(x, z) {

    const group = new THREE.Group();

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xc5a47c
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x613d32
    });

    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(15, 7, 12),
        wallMaterial
    );

    wall.position.y = 3.5;
    wall.castShadow = true;
    wall.receiveShadow = true;

    group.add(wall);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(10, 5, 4),
        roofMaterial
    );

    roof.position.y = 9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;

    group.add(roof);

    // Door
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 4, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x392820
        })
    );

    door.position.set(0, 2, 6.1);

    group.add(door);

    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87c9e8,
        metalness: 0.2,
        roughness: 0.2
    });

    const window1 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2.2, 0.25),
        windowMaterial
    );

    window1.position.set(-4, 4, 6.1);

    group.add(window1);

    const window2 = window1.clone();

    window2.position.x = 4;

    group.add(window2);

    group.position.set(x, 0, z);

    scene.add(group);
}

/* =====================================================
   TREE
===================================================== */

function createTree(x, z) {

    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1, 5),
        new THREE.MeshStandardMaterial({
            color: 0x65452e
        })
    );

    trunk.position.y = 2.5;
    trunk.castShadow = true;

    group.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(3.8, 12, 10),
        new THREE.MeshStandardMaterial({
            color: 0x2f6f3a
        })
    );

    leaves.position.y = 7;
    leaves.castShadow = true;

    group.add(leaves);

    group.position.set(x, 0, z);

    scene.add(group);
}

/* =====================================================
   FENCE
===================================================== */

function createFence(x, z, length, rotation) {

    const group = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({
        color: 0x9a6d43
    });

    for (let i = 0; i < length; i += 3) {

        const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 2.5, 0.4),
            material
        );

        post.position.set(i - length / 2, 1.25, 0);

        post.castShadow = true;

        group.add(post);
    }

    const rail1 = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.35, 0.35),
        material
    );

    rail1.position.y = 1.6;

    group.add(rail1);

    const rail2 = rail1.clone();

    rail2.position.y = 0.7;

    group.add(rail2);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    scene.add(group);
}

/* =====================================================
   FOUNTAIN
===================================================== */

function createFountain() {

    const group = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(9, 9, 1, 32),
        new THREE.MeshStandardMaterial({
            color: 0x858b91
        })
    );

    base.position.y = 0.5;
    base.castShadow = true;

    group.add(base);

    const water = new THREE.Mesh(
        new THREE.CylinderGeometry(7.5, 7.5, 0.25, 32),
        new THREE.MeshStandardMaterial({
            color: 0x4eb8e6,
            transparent: true,
            opacity: 0.8
        })
    );

    water.position.y = 1.05;

    group.add(water);

    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.7, 5, 20),
        new THREE.MeshStandardMaterial({
            color: 0x9da3a8
        })
    );

    pillar.position.y = 3.5;
    pillar.castShadow = true;

    group.add(pillar);

    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 0.6, 20),
        new THREE.MeshStandardMaterial({
            color: 0x9da3a8
        })
    );

    top.position.y = 6;

    group.add(top);

    group.position.set(0, 0, 0);

    scene.add(group);
}

/* =====================================================
   PLAYER
===================================================== */

function createPlayer() {

    player = new THREE.Object3D();

    player.position.set(0, 1.7, 18);

    player.add(camera);

    scene.add(player);
}

/* =====================================================
   WEAPON
===================================================== */

function createWeapon() {

    weapon = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 1.8),
        new THREE.MeshStandardMaterial({
            color: 0x20242a,
            metalness: 0.7,
            roughness: 0.3
        })
    );

    body.position.set(0.45, -0.42, -1.05);

    weapon.add(body);

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 1.1, 12),
        new THREE.MeshStandardMaterial({
            color: 0x101214,
            metalness: 0.8
        })
    );

    barrel.rotation.x = Math.PI / 2;

    barrel.position.set(0.45, -0.38, -2.05);

    weapon.add(barrel);

    const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.5, 0.25),
        new THREE.MeshStandardMaterial({
            color: 0x151719
        })
    );

    grip.position.set(0.45, -0.72, -0.55);
    grip.rotation.x = -0.2;

    weapon.add(grip);

    camera.add(weapon);
}

/* =====================================================
   ENEMIES
===================================================== */

function createEnemies() {

    enemies.forEach(enemy => {
        scene.remove(enemy.group);
    });

    enemies = [];

    const positions = [
        [-25, -25],
        [25, -25],
        [-25, 25],
        [25, 25],
        [-45, 0],
        [45, 0],
        [0, -45],
        [0, 45]
    ];

    positions.forEach((pos, index) => {

        createEnemy(
            pos[0],
            pos[1],
            index
        );
    });

    updateHUD();
}

function createEnemy(x, z, id) {

    const group = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x9e2630
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xd59a72
    });

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 2, 0.8),
        bodyMaterial
    );

    body.position.y = 2;
    body.castShadow = true;

    group.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 12),
        skinMaterial
    );

    head.position.y = 3.45;
    head.castShadow = true;

    group.add(head);

    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0x181818
        })
    );

    gun.position.set(0.75, 2.1, -0.5);
    gun.rotation.x = Math.PI / 2;

    group.add(gun);

    group.position.set(x, 0, z);

    scene.add(group);

    enemies.push({
        group,
        health: 100,
        attackTimer: Math.random(),
        id
    });
}

/* =====================================================
   GAME START
===================================================== */

function startGame() {

    resetGame();

    menu.style.display = "none";
    hud.style.display = "block";

    isPlaying = true;
    isPaused = false;

    requestPointerLock();
}

function restartGame() {

    gameOver.style.display = "none";

    resetGame();

    isPlaying = true;
    isPaused = false;

    hud.style.display = "block";

    requestPointerLock();
}

function resetGame() {

    health = 100;
    ammo = 30;
    reserveAmmo = 120;
    score = 0;

    player.position.set(0, 1.7, 18);

    yaw = 0;
    pitch = 0;

    player.rotation.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);

    isReloading = false;

    createEnemies();

    updateHUD();
}

/* =====================================================
   POINTER LOCK
===================================================== */

function requestPointerLock() {

    document.body.requestPointerLock();
}

function pointerLockChanged() {

    if (!isPlaying) return;

    if (document.pointerLockElement !== document.body) {

        if (!isPaused && !gameOver.style.display.includes("flex")) {

            isPaused = true;
            pauseScreen.style.display = "flex";
        }

    } else {

        isPaused = false;
        pauseScreen.style.display = "none";
    }
}

function resumeGame() {

    pauseScreen.style.display = "none";

    isPaused = false;

    requestPointerLock();
}

/* =====================================================
   MOUSE LOOK
===================================================== */

function onMouseMove(event) {

    if (!isPlaying) return;

    if (document.pointerLockElement !== document.body) {
        return;
    }

    if (isPaused) return;

    yaw -= event.movementX * 0.0022;
    pitch -= event.movementY * 0.0022;

    const limit = Math.PI / 2 - 0.05;

    pitch = Math.max(-limit, Math.min(limit, pitch));

    player.rotation.y = yaw;
    camera.rotation.x = pitch;
}

/* =====================================================
   MOUSE
===================================================== */

function onMouseDown(event) {

    if (!isPlaying) return;

    if (event.button !== 0) return;

    if (document.pointerLockElement !== document.body) {

        requestPointerLock();
        return;
    }

    shoot();
}

/* =====================================================
   KEYBOARD
===================================================== */

function onKeyDown(event) {

    keys[event.code] = true;

    if (event.code === "KeyR") {

        reload();
    }

    if (event.code === "Escape") {

        if (isPlaying && document.pointerLockElement === document.body) {

            document.exitPointerLock();
        }
    }
}

function onKeyUp(event) {

    keys[event.code] = false;
}

/* =====================================================
   SHOOT
===================================================== */

function shoot() {

    if (!isPlaying || isPaused || isReloading) return;

    const now = performance.now();

    if (now - lastShot < 140) return;

    lastShot = now;

    if (ammo <= 0) {

        reload();
        return;
    }

    ammo--;

    updateHUD();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const targets = [];

    enemies.forEach(enemy => {

        enemy.group.traverse(object => {

            if (object.isMesh) {
                targets.push(object);
            }
        });
    });

    const hits = raycaster.intersectObjects(targets, false);

    if (hits.length > 0) {

        const hitObject = hits[0].object;

        const enemy = enemies.find(e =>
            e.group === hitObject.parent ||
            e.group === hitObject.parent?.parent
        );

        if (enemy) {

            enemy.health -= 50;

            if (enemy.health <= 0) {

                killEnemy(enemy);
            }
        }
    }

    createBulletEffect();
}

/* =====================================================
   BULLET EFFECT
===================================================== */

function createBulletEffect() {

    const geometry = new THREE.SphereGeometry(
        0.025,
        6,
        6
    );

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffaa
    });

    const bullet = new THREE.Mesh(
        geometry,
        material
    );

    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);

    bullet.position.copy(camera.getWorldPosition(
        new THREE.Vector3()
    ));

    bullet.userData.velocity =
        direction.multiplyScalar(80);

    bullet.userData.life = 0.5;

    scene.add(bullet);

    bullets.push(bullet);
}

/* =====================================================
   KILL ENEMY
===================================================== */

function killEnemy(enemy) {

    score += 100;

    scene.remove(enemy.group);

    enemies = enemies.filter(e => e !== enemy);

    setTimeout(() => {

        if (isPlaying) {

            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;

            createEnemy(
                x,
                z,
                Math.random()
            );
        }

    }, 1200);

    updateHUD();
}

/* =====================================================
   RELOAD
===================================================== */

function reload() {

    if (isReloading) return;

    if (ammo >= 30) return;

    if (reserveAmmo <= 0) return;

    isReloading = true;

    reloadText.style.display = "block";

    setTimeout(() => {

        const needed = 30 - ammo;

        const amount = Math.min(
            needed,
            reserveAmmo
        );

        ammo += amount;
        reserveAmmo -= amount;

        isReloading = false;

        reloadText.style.display = "none";

        updateHUD();

    }, 1200);
}

/* =====================================================
   PLAYER DAMAGE
===================================================== */

function damagePlayer(amount) {

    if (!isPlaying) return;

    health -= amount;

    health = Math.max(0, health);

    updateHUD();

    if (health <= 0) {

        endGame();
    }
}

/* =====================================================
   ENEMY AI
===================================================== */

function updateEnemies(delta) {

    if (!isPlaying || isPaused) return;

    const playerPosition = player.position;

    enemies.forEach(enemy => {

        const enemyPosition = enemy.group.position;

        const direction = new THREE.Vector3(
            playerPosition.x - enemyPosition.x,
            0,
            playerPosition.z - enemyPosition.z
        );

        const distance = direction.length();

        if (distance > 5) {

            direction.normalize();

            enemyPosition.addScaledVector(
                direction,
                delta * 2.2
            );

            enemy.group.rotation.y =
                Math.atan2(
                    direction.x,
                    direction.z
                );
        }

        enemy.attackTimer -= delta;

        if (distance < 7 && enemy.attackTimer <= 0) {

            enemy.attackTimer = 1.0;

            damagePlayer(5);
        }
    });
}

/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function updatePlayer(delta) {

    if (!isPlaying || isPaused) return;

    const speed = 9;

    const direction = new THREE.Vector3();

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

    if (direction.lengthSq() === 0) {
        return;
    }

    direction.normalize();

    const forward = new THREE.Vector3(
        -Math.sin(yaw),
        0,
        -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    );

    const movement = new THREE.Vector3();

    movement.addScaledVector(
        right,
        direction.x
    );

    movement.addScaledVector(
        forward,
        -direction.z
    );

    movement.normalize();

    player.position.addScaledVector(
        movement,
        speed * delta
    );

    // Keep player inside map
    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -80,
            80
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -80,
            80
        );
}

/* =====================================================
   BULLETS
===================================================== */

function updateBullets(delta) {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.position.addScaledVector(
            bullet.userData.velocity,
            delta
        );

        bullet.userData.life -= delta;

        if (bullet.userData.life <= 0) {

            scene.remove(bullet);

            bullets.splice(i, 1);
        }
    }
}

/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    healthFill.style.width =
        `${health}%`;

    healthText.textContent =
        health;

    ammoText.textContent =
        ammo;

    scoreText.textContent =
        score;

    enemyCount.textContent =
        enemies.length;
}

/* =====================================================
   GAME OVER
===================================================== */

function endGame() {

    isPlaying = false;

    document.exitPointerLock();

    hud.style.display = "none";

    gameOver.style.display = "flex";

    finalScore.textContent = score;
}

/* =====================================================
   MAIN MENU
===================================================== */

function returnToMenu() {

    isPlaying = false;
    isPaused = false;

    document.exitPointerLock();

    pauseScreen.style.display = "none";
    gameOver.style.display = "none";
    hud.style.display = "none";

    menu.style.display = "flex";
}

/* =====================================================
   RESIZE
===================================================== */

function onResize() {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}

/* =====================================================
   ANIMATION
===================================================== */

function animate() {

    requestAnimationFrame(animate);

    const now = performance.now();

    const delta =
        Math.min((now - lastTime) / 1000, 0.05);

    lastTime = now;

    updatePlayer(delta);
    updateEnemies(delta);
    updateBullets(delta);

    renderer.render(scene, camera);
}
```
