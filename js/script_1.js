var canvas = document.getElementById("myCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Création de la scène
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
var physicsPlugin = new BABYLON.CannonJSPlugin();
scene.enablePhysics(gravityVector, physicsPlugin);

var cena = new BABYLON.Sound("wallSound", "../lib/music/cena_test.mp3", scene);

var sound = new BABYLON.Sound("wallSound", "../lib/music/sound.mp3", scene);

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

/*
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
*/
// MUR NOTE DE MUSIQUE //

var wallDo = BABYLON.MeshBuilder.CreateBox("wallDo", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallDo.position.z = x;
wallDo.position.y = y;
wallDo.position.x = -2;

//changer Mur en noir
wallDo.material = new BABYLON.StandardMaterial("wallDo", scene);
wallDo.material.diffuseColor = new BABYLON.Color3(0, 0, 0);


var wallRe = BABYLON.MeshBuilder.CreateBox("wallRe", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallRe.position.z = x;
wallRe.position.y = y;
wallRe.position.x = 0;

//changer Mur en marron
wallRe.material = new BABYLON.StandardMaterial("wallRe", scene);
wallRe.material.diffuseColor = new BABYLON.Color3(0.5, 0.25, 0);


var wallMi = BABYLON.MeshBuilder.CreateBox("wallMi", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallMi.position.z = x;
wallMi.position.y = y;
wallMi.position.x = 2;

wallMi.material = new BABYLON.StandardMaterial("wallMi", scene);
wallMi.material.diffuseColor = new BABYLON.Color3(1, 0, 1);

var wallFa = BABYLON.MeshBuilder.CreateBox("wallFa", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallFa.position.x = -x;
wallFa.position.y = y;
wallFa.position.z = -2;

wallFa.material = new BABYLON.StandardMaterial("wallFa", scene);
wallFa.material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);

var wallSol = BABYLON.MeshBuilder.CreateBox("wallSol", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallSol.position.x = -x;
wallSol.position.y = y;
wallSol.position.z = 0;

wallSol.material = new BABYLON.StandardMaterial("wallSol", scene);
wallSol.material.diffuseColor = new BABYLON.Color3(1, 1, 0);


var wallLa = BABYLON.MeshBuilder.CreateBox("wallLa", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallLa.position.z = -x;
wallLa.position.y = y;
wallLa.position.x = -2;

wallLa.material = new BABYLON.StandardMaterial("wallLa", scene);
wallLa.material.diffuseColor = new BABYLON.Color3(0, 1, 0);


var wallSi = BABYLON.MeshBuilder.CreateBox("wallSi", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallSi.position.z = -x;
wallSi.position.y = y;
wallSi.position.x = 0;

wallSi.material = new BABYLON.StandardMaterial("wallSi", scene);
wallSi.material.diffuseColor = new BABYLON.Color3(0, 1, 1);

var wallDo2 = BABYLON.MeshBuilder.CreateBox("wallDo2", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
wallDo2.position.z = -x;
wallDo2.position.y = y;
wallDo2.position.x = 2;

wallDo2.material = new BABYLON.StandardMaterial("wallDo2", scene);
wallDo2.material.diffuseColor = new BABYLON.Color3(0, 0, 1);



var wallDoRe = BABYLON.MeshBuilder.CreateBox("wallDoRe", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallDoRe.position.x = x;
wallDoRe.position.y = y;
wallDoRe.position.z = -2;

wallDoRe.material = new BABYLON.StandardMaterial("wallDoRe", scene);
wallDoRe.material.diffuseColor = new BABYLON.Color3(1, 0, 0.5);

var wallReMi = BABYLON.MeshBuilder.CreateBox("wallReMi", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallReMi.position.x = x;
wallReMi.position.y = y;
wallReMi.position.z = 0;

wallReMi.material = new BABYLON.StandardMaterial("wallReMi", scene);
wallReMi.material.diffuseColor = new BABYLON.Color3(1, 1, 1);

var wallMiFa = BABYLON.MeshBuilder.CreateBox("wallMiFa", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallMiFa.position.x = x;
wallMiFa.position.y = y;
wallMiFa.position.z = 2;

wallMiFa.material = new BABYLON.StandardMaterial("wallMiFa", scene);
wallMiFa.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);


var wallFaSol = BABYLON.MeshBuilder.CreateBox("wallFaSol", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
wallFaSol.position.x = -x;
wallFaSol.position.y = y;
wallFaSol.position.z = 2;

/*

var wallSolLa = BABYLON.MeshBuilder.CreateBox("wallSolLa", {width: 0.1, height: heightWall, depth: x*2}, scene);
wallSolLa.position.x = x;
wallSolLa.position.y = y;

var wallLaSi = BABYLON.MeshBuilder.CreateBox("wallLaSi", {width: 0.1, height: heightWall, depth: x*2}, scene);
wallLaSi.position.x = x;
wallLaSi.position.y = y;

// MUR NOTE DE MUSIQUE //
*/



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
    wallRe.checkCollisions = true;
    wallMi.checkCollisions = true;
    wallFa.checkCollisions = true;
    wallSol.checkCollisions = true;
    wallLa.checkCollisions = true;
    wallSi.checkCollisions = true;
    wallDo2.checkCollisions = true;
    wallDo.checkCollisions = true;

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
    wallRe.physicsImpostor = new BABYLON.PhysicsImpostor(wallRe, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallMi.physicsImpostor = new BABYLON.PhysicsImpostor(wallMi, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallFa.physicsImpostor = new BABYLON.PhysicsImpostor(wallFa, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallSol.physicsImpostor = new BABYLON.PhysicsImpostor(wallSol, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallLa.physicsImpostor = new BABYLON.PhysicsImpostor(wallLa, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallSi.physicsImpostor = new BABYLON.PhysicsImpostor(wallSi, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallDo2.physicsImpostor = new BABYLON.PhysicsImpostor(wallDo2, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallDo.physicsImpostor = new BABYLON.PhysicsImpostor(wallDo, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallDoRe.physicsImpostor = new BABYLON.PhysicsImpostor(wallDoRe, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallReMi.physicsImpostor = new BABYLON.PhysicsImpostor(wallReMi, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallFaSol.physicsImpostor = new BABYLON.PhysicsImpostor(wallFaSol, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    wallMiFa.physicsImpostor = new BABYLON.PhysicsImpostor(wallMiFa, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);


    sphere.physicsImpostor.registerOnPhysicsCollide(wallRe.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallMi.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallFa.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallSol.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallLa.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallSi.physicsImpostor, function(main, collided) {
        sound.play();
    });
    sphere.physicsImpostor.registerOnPhysicsCollide(wallDo2.physicsImpostor, function(main, collided) {
        sound.play();
    });

    sphere.physicsImpostor.registerOnPhysicsCollide(wallDo.physicsImpostor, function(main, collided) {
        sound.play();
    });

    sphere.physicsImpostor.registerOnPhysicsCollide(wallMiFa.physicsImpostor, function(main, collided) {
        sound.play();
    });



    sphere.physicsImpostor.registerOnPhysicsCollide(wallDoRe.physicsImpostor, function(main, collided) {
        sound.play();
    });

    sphere.physicsImpostor.registerOnPhysicsCollide(wallReMi.physicsImpostor, function(main, collided) {
        sound.play();
    });

    sphere.physicsImpostor.registerOnPhysicsCollide(wallFaSol.physicsImpostor, function(main, collided) {
        sound.play();
    });

// Lancement de la boucle de rendu
engine.runRenderLoop(function() {
    scene.render();
});