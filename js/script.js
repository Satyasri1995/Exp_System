import * as THREE from "https://unpkg.com/three/build/three.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const clock = new THREE.Clock();
const renderer = new THREE.WebGLRenderer();
const meshes = {};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const systemGroup = new THREE.Group();
let cameraTarget = null;
let cameraPosition = new THREE.Vector3(0, 0, 220);
const systemJson = [
  {
    name: "Tata Consultancy Services",
    radius: 6,
    color: "Yellow",
    children: [
      {
        name: "Project1",
        radius: 2,
        color: "green",
        orbitRadius: 20,
        children: [
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
        ],
      },
      {
        name: "Project2",
        radius: 3,
        color: "limegreen",
        orbitRadius: 50,
        children: [
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
        ],
      },
      {
        name: "Project3",
        radius: 4,
        color: "skyblue",
        orbitRadius: 90,
        children: [
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
        ],
      },
      {
        name: "Project4",
        radius: 2,
        color: "orange",
        orbitRadius: 125,
        children: [
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
          {
            name: "Tech1",
            color: "white",
          },
        ],
      },
    ],
  },
];

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed=0.5;
controls.autoRotateSpeed=0.5;
controls.autoRotate=true;
controls.maxDistance=220;

camera.position.set(0, 0, 220);
camera.lookAt(0, 0, 0);

controls.update();

function addStars() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 10000;
  const posArray = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 2000;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  const sprite = new THREE.TextureLoader().load("./../assets/star.png");
  const starMaterial = new THREE.PointsMaterial({
    size: 0.2,
    map: sprite,
    color: "white",
    transparent: true,
  });
  meshes.star = new THREE.Points(starGeo, starMaterial);
  scene.add(meshes.star);
}

function animateSystem() {
  // const elapsedTime = clock.getElapsedTime();
  // meshes.star.rotation.y = -0.1 * elapsedTime;
  // systemGroup.rotation.y = -0.1 * elapsedTime;
}

function onClickOnSphere() {
  cameraTarget = this;
  controls.maxDistance=10;
  this.material.color = new THREE.Color("red");
  setTimeout(() => {
    this.material.color = new THREE.Color(this.color);
    controls.maxDistance=220;
  }, 1000);
}

function makeSphere(radius = 5, color = "yellow", name) {
  const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
  sphere.name = name;
  sphere.onMouseClick = onClickOnSphere;
  return sphere;
}

function drawSystem() {
  systemJson.forEach((item) => {
    const sphere = makeSphere(item.radius, item.color, item.name);
    systemGroup.add(sphere);
    item.children.forEach((subitem, i) => {
      const orbit = buildRing(subitem.orbitRadius, true, 200);
      orbit.position.set(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z
      );
      const innerSphere = makeSphere(
        subitem.radius,
        subitem.color,
        subitem.name
      );
      innerSphere.position.set(
        orbit.position.x + subitem.orbitRadius,
        orbit.position.y,
        orbit.position.z
      );
      subitem.children.forEach((techsubitem, index) => {
        const innerOrbit = buildRing(
          subitem.radius * (index + 1) * 1.5,
          true,
          200
        );
        innerOrbit.position.set(
          innerSphere.position.x - subitem.orbitRadius,
          innerSphere.position.y,
          innerSphere.position.z
        );
        const techSphere = makeSphere(0.5, techsubitem.color, techsubitem.name);
        techSphere.position.set(
          innerOrbit.position.x - subitem.radius * (index + 1) * 1.5,
          innerOrbit.position.y,
          innerOrbit.position.z
        );
        innerOrbit.isOrbit = true;
        innerOrbit.add(techSphere);
        innerOrbit.rotation.y = Math.random() * 360;
        innerOrbit.rotationSpeed = subitem.children.length - i;
        innerOrbit.clockwise = i % 2 == 0;
        innerSphere.add(innerOrbit);
      });

      innerSphere.color = subitem.color;
      innerSphere.name = subitem.name;
      orbit.add(innerSphere);
      orbit.rotation.y = Math.random() * 360;
      orbit.isOrbit = true;
      orbit.rotationSpeed = item.children.length - i;
      orbit.clockwise = i % 2 === 0;
      sphere.add(orbit);
    });
    sphere.name = item.name;
    sphere.color = item.color;
    systemGroup.add(sphere);
  });
  systemGroup.rotation.x = 90;
  scene.add(systemGroup);
}

function buildRing(orbitRadius, orbitVisible = true, resolution = 200) {
  const ringCurve = new THREE.EllipseCurve(
    0,
    0,
    orbitRadius,
    orbitRadius,
    0, //startAngle=0
    orbitVisible ? 2 * Math.PI : 0, //endAngle= 2 * Math.PI
    false,
    0
  );
  const ringPoints = ringCurve.getPoints(resolution);
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMat = new THREE.LineBasicMaterial({ color: "grey" });
  const ring = new THREE.Line(ringGeo, ringMat);
  return ring;
}

function animateRings() {
  const elapsedTime = clock.getElapsedTime();
  systemGroup.traverse((object) => {
    if (object.isOrbit) {
      object.rotation.z =
        (object.clockwise ? -0.1 : 0.1) * object.rotationSpeed * elapsedTime;
    }
  });
}

function focusCameraToTarget() {
  if (cameraTarget) {
    const camPosition = new THREE.Vector3();
    camera.getWorldPosition(camPosition);
    const camTargetPosition = new THREE.Vector3();
    cameraTarget.getWorldPosition(camTargetPosition);
    controls.target = camTargetPosition;
    controls.update();
  }
}



function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    let mesh = intersects.find(
      (item) => typeof item.object.onMouseClick === "function"
    );
    if (mesh) {
      mesh.object.onMouseClick();
    }
  }
}




addStars();
drawSystem();

window.addEventListener("mousedown", onDocumentMouseDown);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  focusCameraToTarget();
  animateSystem();
  animateRings();
  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
