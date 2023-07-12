var canvas = document.getElementById("myCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Création de la scène
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
var physicsPlugin = new BABYLON.CannonJSPlugin();
scene.enablePhysics(gravityVector, physicsPlugin);

var sound = new BABYLON.Sound("wallSound", "../lib/music/cena_test.mp3", scene);

// Variables de la scène
var x = 3;
var y = 3;
var heightWall = x*2;

/*
// Création d'une caméra en hauteur visant le centre de la scène
var scene_camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 20, -10), scene);
scene_camera.setTarget(BABYLON.Vector3.Zero());
*/

// Création de la caméra en VR
var camera = new BABYLON.UniversalCamera("vrCam", new BABYLON.Vector3(0, 2.5, 0), scene);

// Touch or click the rendering canvas to enter VR Mode
scene.onPointerDown = function () {
    scene.onPointerDown = undefined;
    camera.attachControl(canvas, true);
    // Enable VR
    var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false});
    vrHelper.enableInteractions();
};

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Our built-in 'ground' shape.
var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: x*2, height: x*2}, scene);

// Create walls
var wall1 = BABYLON.MeshBuilder.CreateBox("wall1", {width: x*2, height: heightWall, depth: 0.1}, scene);
wall1.position.z = x;
wall1.position.y = y;

var wall2 = BABYLON.MeshBuilder.CreateBox("wall2", {width: 0.1, height: heightWall, depth: x*2}, scene);
wall2.position.x = -x;
wall2.position.y = y;

var wall3 = BABYLON.MeshBuilder.CreateBox("wall3", {width: x*2, height: heightWall, depth: 0.1}, scene);
wall3.position.z = -x;
wall3.position.y = y;

var wall4 = BABYLON.MeshBuilder.CreateBox("wall4", {width: 0.1, height: heightWall, depth: x*2}, scene);
wall4.position.x = x;
wall4.position.y = y;

//OBJECTS//

    // Create a sphere
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5}, scene);
    sphere.position.y = 1.5;
    sphere.position.x = 1.5;


    // add colilision
    sphere.checkCollisions = true;
    sphere.isGrabbable = true;
    sphere.isPickable = true;

    ground.checkCollisions = true;
    wall1.checkCollisions = true;
    wall2.checkCollisions = true;
    wall3.checkCollisions = true;
    wall4.checkCollisions = true;

    //attraper un objet avec la gachette du controller
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh.isGrabbable) {
                    pointerInfo.pickInfo.pickedMesh.grabbed = true;
                    pointerInfo.pickInfo.pickedMesh.physicsImpostor.setMass(0);
                    pointerInfo.pickInfo.pickedMesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
                    pointerInfo.pickInfo.pickedMesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                }
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                if (pointerInfo.pickInfo.pickedMesh && pointerInfo.pickInfo.pickedMesh.grabbed) {
                    pointerInfo.pickInfo.pickedMesh.grabbed = false;
                    pointerInfo.pickInfo.pickedMesh.physicsImpostor.setMass(1);
                }
                break;
        }
    });

    // move object with controller
    scene.registerBeforeRender(function () {
        if (sphere.grabbed) {
            var pick = scene.pick(scene.pointerX, scene.pointerY);
            sphere.position.x = pick.pickedPoint.x;
            sphere.position.y = pick.pickedPoint.y;
            sphere.position.z = pick.pickedPoint.z;
        }
    });


    // set physics to objects
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.9}, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wall1.physicsImpostor = new BABYLON.PhysicsImpostor(wall1, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wall2.physicsImpostor = new BABYLON.PhysicsImpostor(wall2, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wall3.physicsImpostor = new BABYLON.PhysicsImpostor(wall3, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wall4.physicsImpostor = new BABYLON.PhysicsImpostor(wall4, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);


    // faire jouer un son quand un objet touche un mur
    sphere.physicsImpostor.registerOnPhysicsCollide(wall1.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wall2.physicsImpostor, function(main, collided) {
        sound.play();
     });

    sphere.physicsImpostor.registerOnPhysicsCollide(wall3.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wall4.physicsImpostor, function(main, collided) {
        sound.play();
    });


// Lancement de la boucle de rendu
engine.runRenderLoop(function() {
    scene.render();
});