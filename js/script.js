window.onload = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const mouse = { x: 0, y: 0 };
  const clock = new THREE.Clock();
  const renderer = new THREE.WebGLRenderer();
  const meshes = {};

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 50;

  function addStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 500;
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

  function animateStars() {
    const elapsedTime = clock.getElapsedTime();
    meshes.star.rotation.y = -0.1 * elapsedTime;
    if (mouse.x > 0) {
      meshes.star.rotation.x = mouse.y * elapsedTime * 0.00008;
      meshes.star.rotation.y = mouse.x * elapsedTime * 0.00008;
    }
  }

  function addSun(sunRadius=5){
    const sunGeo = new THREE.SphereGeometry(sunRadius,32,32);
    const sunMat = new THREE.MeshBasicMaterial({color:'limegreen'});
    const sunMesh = new THREE.Mesh(sunGeo,sunMat);
    scene.add(sunMesh);
  }

  function addRings(orbitRadius = 10,orbitColor="orange", planetRadius = 1, planetColor = "blue") {
    const circleCurve = new THREE.EllipseCurve(
      0,
      0,
      orbitRadius,
      orbitRadius,
      0,
      2 * Math.PI,
      false,
      0
    );
    const circlePoints = circleCurve.getPoints(32);
    const cg1 = new THREE.BufferGeometry().setFromPoints(circlePoints);
    const cma1 = new THREE.LineBasicMaterial({ color: orbitColor });
    const orbit = new THREE.Line(cg1, cma1);
    orbit.rotation.x = 90;
    const spg = new THREE.SphereGeometry(
      planetRadius,
      planetRadius * 10,
      planetRadius * 10
    );
    const spma = new THREE.MeshBasicMaterial({ color: planetColor });
    const spme = new THREE.Mesh(spg, spma);
    orbit.add(spme);
    spme.position.x = orbitRadius;
    meshes.rings = [...(meshes.rings ? meshes.rings : []), orbit];
    scene.add(meshes.rings[meshes.rings.length - 1]);
  }

  function animateRings() {
    const elapsedTime = clock.getElapsedTime();
    meshes.rings.forEach((__ring, index) => {
      meshes.rings[index].rotation.z = (index%2==0?-1:1) *
        0.1 * (meshes.rings.length - index) * elapsedTime;
    });
  }

  addStars();
  addRings(10,"yellow",0.5,"yellow");
  addRings(15,"green",1,"green");
  addRings(20,"skyblue",2,"skyblue");
  addRings(25,"purple",2.5,"purple");
  addRings(32,"magenta",1,"magenta");
  addSun(5);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  function animate() {
    animateStars();
    animateRings();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};
