window.onload = () => {
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

  camera.position.z = 70;

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
    planetName="Planet"
  ) {
    if (meshes.systemGroup) {
      const circleCurve = new THREE.EllipseCurve(
        0,
        0,
        orbitRadius,
        orbitRadius,
        0, //startAngle=0
        2 * Math.PI, //endAngle= 2 * Math.PI
        false,
        0
      );
      const circlePoints = circleCurve.getPoints(32);
      const cg1 = new THREE.BufferGeometry().setFromPoints(circlePoints);
      const cma1 = new THREE.LineBasicMaterial({ color: orbitColor });
      const orbit = new THREE.Line(cg1, cma1);
      orbit.rotation.x = 90;
      orbit.rotation.y = Math.random() * 360;
      const spg = new THREE.SphereGeometry(
        planetRadius,
        planetRadius * 10,
        planetRadius * 10
      );
      const spma = new THREE.MeshBasicMaterial({ color: planetColor });
      const spme = new THREE.Mesh(spg, spma);
      spme.callback = zoomToCamera;
      spme.planetColor=planetColor;
      spme.name=planetName;
      orbit.add(spme);
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
    this.material.color=new THREE.Color("red");
    setTimeout(()=>{
      this.material.color=new THREE.Color(this.planetColor);
    },1000);
  }

  function animateRings() {
    const elapsedTime = clock.getElapsedTime();
    meshes.rings.forEach((__ring, index) => {
      meshes.rings[index].rotation.z =
        (index % 2 == 0 ? -1 : 1) *
        0.1 *
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
  addRings(10, "gray", 1, "limegreen",'1st');
  addRings(20, "gray", 1, "green",'2nd');
  addRings(30, "gray", 2, "skyblue",'3rd');
  addRings(40, "gray", 2.5, "purple",'4th');

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
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};
