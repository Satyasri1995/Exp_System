
import * as THREE from "https://unpkg.com/three/build/three.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
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

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 0, 200);
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

function animateStarsAndSystem() {
  const elapsedTime = clock.getElapsedTime();
  meshes.star.rotation.y = -0.1 * elapsedTime;
  meshes.systemGroup.rotation.y = -0.1 * elapsedTime;
}

function addSun(sunRadius = 5, color = "yellow") {
  const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: color });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);
}

function addRings(
  orbitRadius = 10,
  orbitColor = "orange",
  planetRadius = 1,
  planetColor = "blue",
  planetName = "Planet"
) {
  if (meshes.systemGroup) {
    const circleCurve = new THREE.EllipseCurve(
      0,
      0,
      orbitRadius,
      orbitRadius,
      0, //startAngle=0
      2 * Math.PI, //endAngle= 2 * Math.PI
      // 0, //endAngle= 2 * Math.PI
      false,
      0
    );
    const circlePoints = circleCurve.getPoints(200);
    const cg1 = new THREE.BufferGeometry().setFromPoints(circlePoints);
    const cma1 = new THREE.LineBasicMaterial({ color: orbitColor });
    const orbit = new THREE.Line(cg1, cma1);
    orbit.rotation.x = 90;
    // orbit.rotation.y = Math.random() * 360;
    const spg = new THREE.SphereGeometry(
      planetRadius,
      planetRadius * 10,
      planetRadius * 10
    );
    const spma = new THREE.MeshBasicMaterial({ color: planetColor });
    const spme = new THREE.Mesh(spg, spma);
    spme.callback = zoomToCamera;
    spme.planetColor = planetColor;
    spme.name = planetName;
    const planetWithSatelites = buildSatelites(spme,planetRadius,planetColor,orbitColor);
    orbit.add(planetWithSatelites);
    spme.position.x = orbitRadius;
    meshes.rings = [...(meshes.rings ? meshes.rings : []), orbit];
    meshes.systemGroup.add(meshes.rings[meshes.rings.length - 1]);
  } else {
    meshes.systemGroup = new THREE.Group();
    scene.add(meshes.systemGroup);
    addRings(orbitRadius, orbitColor, planetRadius, planetColor);
  }
}

function zoomToCamera() {
  this.material.color = new THREE.Color("red");
  setTimeout(() => {
    this.material.color = new THREE.Color(this.planetColor);
  }, 1000);
}

function buildRing(orbitRadius,orbitVisible=true,resolution=200,orbitColor){
  const ringCurve = new THREE.EllipseCurve(
    0,
    0,
    orbitRadius,
    orbitRadius,
    0, //startAngle=0
    orbitVisible?2 * Math.PI:0, //endAngle= 2 * Math.PI
    false,
    0
  );
  const ringPoints = ringCurve.getPoints(resolution);
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMat = new THREE.LineBasicMaterial({ color: "grey" });
  const ring = new THREE.Line(ringGeo, ringMat);
  return ring;
}

function buildSatelites(planet,planetRadius,color,orbitColor){
  for(let i=1;i<5;i++){
    const ring = buildRing(planetRadius*2*i,false,200);
    ring.position.set(planet.position.x,planet.position.y,planet.position.z);
    const spGeo = new THREE.SphereGeometry(1,32,32);
    const spMat = new THREE.MeshBasicMaterial({color:color});
    const mesh = new THREE.Mesh(spGeo,spMat);
    mesh.position.set(planet.position.x+(planetRadius*2*i),planet.position.y,planet.position.z);
    ring.add(mesh);
    ring.rotation.y=Math.random()*360;
    meshes.rings = [...(meshes.rings ? meshes.rings : []), ring];
    planet.add(ring);
  }
  return planet;
}

function animateRings() {
  const elapsedTime = clock.getElapsedTime();
  meshes.rings.forEach((__ring, index) => {
    meshes.rings[index].rotation.z =
      (index % 2 == 0 ? -1 : 1) *
      0.01 *
      (meshes.rings.length - index) *
      elapsedTime;
  });
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    let mesh = intersects.find(
      (item) => typeof item.object.callback === "function"
    );
    if (mesh) {
      mesh.object.callback();
    }
  }
}

addStars();
addRings(25, "gray", 2, "limegreen", "1st");
addRings(50, "gray", 3, "green", "2nd");
addRings(80, "gray", 4, "skyblue", "3rd");
// addRings(120, "gray", 2.5, "purple", "4th");

addSun(5, "yellow");

window.addEventListener("mousedown", onDocumentMouseDown);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  animateStarsAndSystem();
  animateRings();
  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
