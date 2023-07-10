var canvas = document.getElementById("myCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Création de la scène
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

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

// Lancement de la boucle de rendu
engine.runRenderLoop(function() {
    scene.render();
});