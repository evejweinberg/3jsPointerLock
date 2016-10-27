var camera, scene, renderer;
var geometry, material, mesh;
var controls;

var objects = [];

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var camera, scene;
var canvasRenderer, webglRenderer;
var container, mesh, geometry, plane;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight /
    2;
    var controlsEnabled = false;

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var canJump = false;
    var d = 200;

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();


// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

      var fullscreenchange = function ( event ) {

        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          element.requestPointerLock();
        }

      };

      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

      element.requestFullscreen();

    } else {

      element.requestPointerLock();

    }

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();



function init() {

  // container = document.createElement('div');
  // document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(1200,1000,0)
  // camera.position.x = 1200;
  // camera.position.y = 1000;
  // camera.lookAt({
  //     x: 0,
  //     y: 0,
  //     z: 0
  // });
  scene = new THREE.Scene();

  // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
  var groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x6C6C6C
  });
  plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
  // LIGHTS
  scene.add(new THREE.AmbientLight(0x666666));
  var light;
  light = new THREE.DirectionalLight(0xdfebff, 1.75);
  light.position.set(300, 400, 50);
  light.position.multiplyScalar(1.3);
  light.castShadow = true;
  // light.shadowCameraVisible = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  var d = 200;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.camera.far =
      1000;
  // light.shadowDarkness = 0.2;
  scene.add(light);
  var boxgeometry = new THREE.CubeGeometry(100, 100, 100);
  var boxmaterial = new THREE.MeshLambertMaterial({
      color: 0x0aeedf
  });
  var cube = new THREE.Mesh(boxgeometry, boxmaterial);
  cube.castShadow = true;
  cube.position.x = 0;
  cube.position.y = 100;
  cube.position.z = 0;
  scene.add(cube); // RENDERER
  webglRenderer = new THREE.WebGLRenderer();
  webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  webglRenderer.domElement.style.position = "relative";
  webglRenderer.shadowMap.enabled = true;
  webglRenderer.shadowMapSoft = true;
    document.body.appendChild( webglRenderer.domElement );
  // container.appendChild(webglRenderer.domElement);





//SpotLight( color, intensity, distance, angle, penumbra, decay )
  // var flashlight = new THREE.SpotLight(0xffffff,.5,200,80);
  // camera.add(flashlight);
  // flashlight.castShadow = true;
  // flashlight.position.set(0,0,1);
  // flashlight.target = camera;



  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );



  loadKeyPresses()



  window.addEventListener('resize', onWindowResize, false);



}

function onWindowResize() {

  webglRenderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();


}

function animate() {

  var timer = Date.now() * 0.0002;
  // camera.position.x = Math.cos(timer) * 1000;
  // camera.position.z = Math.sin(timer) * 1000;
  requestAnimationFrame(animate);
  render();



  requestAnimationFrame( animate );

  if ( controlsEnabled ) {
    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects( objects );

    var isOnObject = intersections.length > 0;

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    if ( moveForward ) velocity.z -= 400.0 * delta;
    if ( moveBackward ) velocity.z += 400.0 * delta;

    if ( moveLeft ) velocity.x -= 400.0 * delta;
    if ( moveRight ) velocity.x += 400.0 * delta;

    if ( isOnObject === true ) {
      velocity.y = Math.max( 0, velocity.y );

      canJump = true;
    }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;

  }


}

function render() {
    // camera.lookAt(scene.position);
    webglRenderer.render(scene, camera);
}
