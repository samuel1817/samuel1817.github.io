import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { PointerLockControls } from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";


/* =========================
   UI
========================= */

const menu =
  document.getElementById("menu");

const hud =
  document.getElementById("hud");

const pause =
  document.getElementById("pause");

const gameover =
  document.getElementById("gameover");

const startBtn =
  document.getElementById("startBtn");

const resumeBtn =
  document.getElementById("resumeBtn");

const menuBtn =
  document.getElementById("menuBtn");

const restartBtn =
  document.getElementById("restartBtn");

const gameoverMenuBtn =
  document.getElementById("gameoverMenuBtn");

const scoreEl =
  document.getElementById("score");

const enemiesEl =
  document.getElementById("enemies");

const ammoEl =
  document.getElementById("ammo");

const ammoBar =
  document.getElementById("ammoBar");

const healthEl =
  document.getElementById("health");

const healthBar =
  document.getElementById("healthBar");

const messageEl =
  document.getElementById("message");


/* =========================
   THREE.JS
========================= */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x91a99b);

scene.fog =
  new THREE.Fog(
    0x91a99b,
    35,
    120
  );


const camera =
  new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    200
  );

camera.position.set(
  0,
  1.7,
  12
);


const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setPixelRatio(
  Math.min(devicePixelRatio, 2)
);

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document.body.appendChild(
  renderer.domElement
);


/* =========================
   LIGHTING
========================= */

const hemi =
  new THREE.HemisphereLight(
    0xddeee5,
    0x26382d,
    2
  );

scene.add(hemi);


const sun =
  new THREE.DirectionalLight(
    0xfff3d6,
    3.2
  );

sun.position.set(
  -30,
  45,
  20
);

sun.castShadow = true;

sun.shadow.mapSize.set(
  2048,
  2048
);

scene.add(sun);


/* =========================
   CONTROLS
========================= */

const controls =
  new PointerLockControls(
    camera,
    document.body
  );


/* =========================
   GAME VARIABLES
========================= */

const clock =
  new THREE.Clock();

const raycaster =
  new THREE.Raycaster();

const keys = {};

const enemies = [];

let running = false;

let score = 0;

let health = 100;

let ammo = 12;

let reserve = 60;

let reloading = false;

let lastShot = 0;

let damageCooldown = 0;


/* =========================
   MATERIALS
========================= */

const groundMat =
  new THREE.MeshStandardMaterial({
    color: 0x51674e,
    roughness: 1
  });


const roadMat =
  new THREE.MeshStandardMaterial({
    color: 0x464a44,
    roughness: 1
  });


const wallMat =
  new THREE.MeshStandardMaterial({
    color: 0x9a8d75,
    roughness: 0.9
  });


const roofMat =
  new THREE.MeshStandardMaterial({
    color: 0x493f37,
    roughness: 1
  });


const woodMat =
  new THREE.MeshStandardMaterial({
    color: 0x5d4735,
    roughness: 1
  });


/* =========================
   CREATE BOX
========================= */

function box(
  x,
  y,
  z,
  sx,
  sy,
  sz,
  mat = wallMat,
  shadow = true
) {

  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sx,
        sy,
        sz
      ),
      mat
    );

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.castShadow =
    shadow;

  mesh.receiveShadow =
    true;

  scene.add(mesh);

  return mesh;
}


/* =========================
   CREATE CYLINDER
========================= */

function cylinder(
  x,
  y,
  z,
  r,
  h,
  mat
) {

  const mesh =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        r,
        r,
        h,
        10
      ),
      mat
    );

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.castShadow = true;

  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}


/* =========================
   TREE
========================= */

function tree(x, z) {

  cylinder(
    x,
    2,
    z,
    0.32,
    4,
    woodMat
  );


  const leafMat =
    new THREE.MeshStandardMaterial({
      color: 0x294b31,
      roughness: 1
    });


  const crown =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.8,
        10,
        8
      ),
      leafMat
    );

  crown.position.set(
    x,
    4.4,
    z
  );

  crown.castShadow = true;

  scene.add(crown);
}


/* =========================
   BUILD MAP
========================= */

function buildMap() {

  /* Ground */

  box(
    0,
    -0.25,
    0,
    100,
    0.5,
    100,
    groundMat,
    false
  );


  /* Main road */

  box(
    0,
    0.01,
    0,
    10,
    0.03,
    100,
    roadMat,
    false
  );


  box(
    0,
    0.02,
    0,
    100,
    0.03,
    10,
    roadMat,
    false
  );


  /* Houses */

  const houses = [
    [-22, -18],
    [-22, 18],
    [22, -18],
    [22, 18],
    [-34, 2],
    [34, -2]
  ];


  for (const [x, z] of houses) {

    box(
      x,
      2,
      z,
      10,
      4,
      8
    );


    const roof =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          7.3,
          3.5,
          4
        ),
        roofMat
      );

    roof.rotation.y =
      Math.PI / 4;

    roof.position.set(
      x,
      5.7,
      z
    );

    roof.castShadow = true;

    scene.add(roof);


    /* Door */

    box(
      x,
      1.4,
      z + 4.05,
      2,
      2.8,
      0.25,
      woodMat
    );


    /* Windows */

    const glass =
      new THREE.MeshStandardMaterial({
        color: 0x47666a
      });


    box(
      x - 3.1,
      2,
      z + 4.05,
      1.5,
      1.5,
      0.25,
      glass
    );


    box(
      x + 3.1,
      2,
      z + 4.05,
      1.5,
      1.5,
      0.25,
      glass
    );

  }


  /* =========================
     FOUNTAIN
  ========================= */

  cylinder(
    0,
    0.45,
    0,
    3,
    0.8,
    new THREE.MeshStandardMaterial({
      color: 0x888b85,
      roughness: 0.8
    })
  );


  cylinder(
    0,
    1.2,
    0,
    1.2,
    1.1,
    new THREE.MeshStandardMaterial({
      color: 0x9ca19a,
      roughness: 0.7
    })
  );


  const water =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        2.35,
        2.35,
        0.12,
        32
      ),
      new THREE.MeshStandardMaterial({
        color: 0x477f91,
        roughness: 0.2
      })
    );

  water.position.y =
    0.88;

  scene.add(water);


  cylinder(
    0,
    2.1,
    0,
    0.3,
    1.8,
    new THREE.MeshStandardMaterial({
      color: 0xaaa99f
    })
  );


  const cap =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        1,
        0.6,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0xaaa99f
      })
    );

  cap.position.set(
    0,
    3,
    0
  );

  scene.add(cap);


  /* =========================
     TREES
  ========================= */

  for (let i = 0; i < 24; i++) {

    const angle =
      Math.random() *
      Math.PI *
      2;

    const radius =
      38 +
      Math.random() * 10;

    tree(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }


  /* =========================
     FENCES
  ========================= */

  for (
    let z = -30;
    z <= 30;
    z += 3
  ) {

    box(
      -40,
      1,
      z,
      0.2,
      2,
      0.15,
      woodMat
    );

    box(
      40,
      1,
      z,
      0.2,
      2,
      0.15,
      woodMat
    );

  }

}


/* =========================
   CREATE NPC
========================= */

function createEnemy(x, z) {

  const group =
    new THREE.Group();


  const bodyMat =
    new THREE.MeshStandardMaterial({
      color: 0x7b302c,
      roughness: 0.8
    });


  const dark =
    new THREE.MeshStandardMaterial({
      color: 0x202625,
      roughness: 0.7
    });


  /* Body */

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.55,
        1.1,
        5,
        10
      ),
      bodyMat
    );

  body.position.y =
    1.15;

  body.castShadow = true;

  group.add(body);


  /* Head */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.42,
        12,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0xb9826d
      })
    );

  head.position.y =
    2.25;

  head.castShadow = true;

  group.add(head);


  /* Weapon */

  const gun =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.16,
        0.16,
        1.2
      ),
      dark
    );

  gun.position.set(
    0.65,
    1.35,
    -0.25
  );

  gun.rotation.y =
    0.25;

  gun.castShadow = true;

  group.add(gun);


  group.position.set(
    x,
    0,
    z
  );


  scene.add(group);


  enemies.push({
    group,
    health: 100,
    speed:
      1.4 +
      Math.random() * 0.5,
    attack: 0
  });


  enemiesEl.textContent =
    enemies.length;
}


/* =========================
   RESET ENEMIES
========================= */

function resetEnemies() {

  for (const enemy of enemies) {
    scene.remove(
      enemy.group
    );
  }

  enemies.length = 0;


  const positions = [
    [-15, -32],
    [18, -30],
    [-30, 10],
    [28, 12],
    [12, 34],
    [-18, 32]
  ];


  positions.forEach(
    position =>
      createEnemy(
        position[0],
        position[1]
      )
  );
}


/* =========================
   RESET GAME
========================= */

function resetGame() {

  score = 0;

  health = 100;

  ammo = 12;

  reserve = 60;

  reloading = false;


  scoreEl.textContent =
    score;


  updateHud();


  camera.position.set(
    0,
    1.7,
    12
  );

  camera.rotation.set(
    0,
    0,
    0
  );


  resetEnemies();


  running = true;


  menu.classList.add(
    "hidden"
  );

  gameover.classList.add(
    "hidden"
  );

  pause.classList.add(
    "hidden"
  );

  hud.classList.remove(
    "hidden"
  );
}


/* =========================
   UPDATE HUD
========================= */

function updateHud() {

  ammoEl.textContent =
    ammo;


  ammoBar.style.width =
    (ammo / 12 * 100) +
    "%";


  healthEl.textContent =
    Math.max(
      0,
      Math.ceil(health)
    );


  healthBar.style.width =
    Math.max(
      0,
      health
    ) + "%";


  enemiesEl.textContent =
    enemies.length;
}


/* =========================
   MESSAGE
========================= */

function flashMessage(text) {

  messageEl.textContent =
    text;


  clearTimeout(
    flashMessage.timer
  );


  flashMessage.timer =
    setTimeout(
      () =>
        messageEl.textContent = "",
      900
    );
}


/* =========================
   SHOOT
========================= */

function shoot() {

  if (
    !running ||
    !controls.isLocked ||
    reloading
  ) {
    return;
  }


  const now =
    performance.now();


  if (
    now - lastShot < 140
  ) {
    return;
  }


  lastShot = now;


  if (ammo <= 0) {

    reload();

    return;
  }


  ammo--;

  updateHud();


  raycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );


  const targets = [];


  for (const enemy of enemies) {

    enemy.group.traverse(
      object => {

        if (object.isMesh) {
          targets.push(object);
        }

      }
    );

  }


  const hits =
    raycaster.intersectObjects(
      targets,
      false
    );


  if (!hits.length) {
    return;
  }


  const hit =
    hits[0].object;


  const enemy =
    enemies.find(
      e =>
        e.group === hit.parent ||
        e.group.children.includes(hit)
    );


  if (!enemy) {
    return;
  }


  enemy.health -= 50;


  hit.material.emissive =
    new THREE.Color(
      0x662222
    );

  hit.material.emissiveIntensity =
    0.8;


  setTimeout(() => {

    if (hit.material) {
      hit.material.emissiveIntensity =
        0;
    }

  }, 80);


  if (enemy.health <= 0) {

    scene.remove(
      enemy.group
    );


    const index =
      enemies.indexOf(enemy);


    if (index >= 0) {
      enemies.splice(
        index,
        1
      );
    }


    score += 100;


    scoreEl.textContent =
      score;


    flashMessage(
      "+100 ELIMINATED"
    );


    setTimeout(() => {

      if (!running) {
        return;
      }


      createEnemy(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70
      );

    }, 1200);

  }

}


/* =========================
   RELOAD
========================= */

function reload() {

  if (
    reloading ||
    ammo === 12 ||
    reserve <= 0
  ) {
    return;
  }


  reloading = true;


  flashMessage(
    "RELOADING..."
  );


  setTimeout(() => {

    const need =
      12 - ammo;

    const take =
      Math.min(
        need,
        reserve
      );


    ammo += take;

    reserve -= take;

    reloading = false;


    updateHud();

  }, 900);

}


/* =========================
   PLAYER DAMAGE
========================= */

function damage(amount) {

  if (
    performance.now() <
    damageCooldown ||
    !running
  ) {
    return;
  }


  damageCooldown =
    performance.now() +
    450;


  health -= amount;


  updateHud();


  if (health <= 0) {

    running = false;

    controls.unlock();


    document.getElementById(
      "finalScore"
    ).textContent = score;


    gameover.classList.remove(
      "hidden"
    );
  }
}


/* =========================
   NPC AI
========================= */

function updateEnemies(dt) {

  if (!running) {
    return;
  }


  for (const enemy of enemies) {

    const position =
      enemy.group.position;


    const dx =
      camera.position.x -
      position.x;


    const dz =
      camera.position.z -
      position.z;


    const distance =
      Math.hypot(
        dx,
        dz
      );


    enemy.group.lookAt(
      camera.position.x,
      1.1,
      camera.position.z
    );


    if (distance > 2.5) {

      position.x +=
        (dx / distance) *
        enemy.speed *
        dt;


      position.z +=
        (dz / distance) *
        enemy.speed *
        dt;

    } else {

      enemy.attack -= dt;


      if (
        enemy.attack <= 0
      ) {

        enemy.attack = 1.1;

        damage(8);

      }

    }

  }

}


/* =========================
   PLAYER MOVEMENT
========================= */

function updatePlayer(dt) {

  if (
    !running ||
    !controls.isLocked
  ) {
    return;
  }


  const speed = 8;


  let forward = 0;

  let right = 0;


  if (keys.KeyW)
    forward += 1;

  if (keys.KeyS)
    forward -= 1;

  if (keys.KeyD)
    right += 1;

  if (keys.KeyA)
    right -= 1;


  const length =
    Math.hypot(
      forward,
      right
    ) || 1;


  controls.moveForward(
    (forward / length) *
    speed *
    dt
  );


  controls.moveRight(
    (right / length) *
    speed *
    dt
  );


  camera.position.y =
    1.7;


  camera.position.x =
    THREE.MathUtils.clamp(
      camera.position.x,
      -47,
      47
    );


  camera.position.z =
    THREE.MathUtils.clamp(
      camera.position.z,
      -47,
      47
    );

}


/* =========================
   MENU BUTTONS
========================= */

startBtn.addEventListener(
  "click",
  () => {

    resetGame();

    controls.lock();

  }
);


resumeBtn.addEventListener(
  "click",
  () =>
    controls.lock()
);


restartBtn.addEventListener(
  "click",
  () => {

    resetGame();

    controls.lock();

  }
);


menuBtn.addEventListener(
  "click",
  () => {

    running = false;

    controls.unlock();

    pause.classList.add(
      "hidden"
    );

    hud.classList.add(
      "hidden"
    );

    menu.classList.remove(
      "hidden"
    );

  }
);


gameoverMenuBtn.addEventListener(
  "click",
  () => {

    gameover.classList.add(
      "hidden"
    );

    hud.classList.add(
      "hidden"
    );

    menu.classList.remove(
      "hidden"
    );

  }
);


/* =========================
   POINTER LOCK
========================= */

controls.addEventListener(
  "lock",
  () => {

    if (running) {
      pause.classList.add(
        "hidden"
      );
    }

  }
);


controls.addEventListener(
  "unlock",
  () => {

    if (running) {

      pause.classList.remove(
        "hidden"
      );

    }

  }
);


/* =========================
   KEYBOARD
========================= */

addEventListener(
  "keydown",
  event => {

    keys[event.code] = true;


    if (
      event.code === "KeyR"
    ) {
      reload();
    }

  }
);


addEventListener(
  "keyup",
  event => {

    keys[event.code] = false;

  }
);


/* =========================
   MOUSE SHOOT
========================= */

addEventListener(
  "mousedown",
  event => {

    if (event.button === 0) {
      shoot();
    }

  }
);


/* =========================
   RESIZE
========================= */

addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      innerWidth,
      innerHeight
    );

  }
);


/* =========================
   START WORLD
========================= */

buildMap();

resetEnemies();


/* =========================
   GAME LOOP
========================= */

function animate() {

  requestAnimationFrame(
    animate
  );


  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );


  updatePlayer(dt);

  updateEnemies(dt);


  renderer.render(
    scene,
    camera
  );

}


animate();
