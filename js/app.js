
document.addEventListener('DOMContentLoaded', async () => { // DOMContentLoaded : attend que le document HTML soit complètement chargé et analysé, sans attendre le chargement des feuilles de style, images et sous-frame
    const startButton = document.getElementById('startButton'); // Récupère l'élément HTML avec l'id startButton
    const xrCanvas = document.getElementById('xrCanvas'); // Récupère l'élément HTML avec l'id xrCanvas

    let xrSession = null; 
    let xrReferenceSpace = null; 
    let vrMode = false;

    let meleeMode = false;
    

    let grabbedObject = null; // Ajoutez cette ligne pour suivre l'objet saisi
    let ray_grabbedObject = null; // Ajoutez cette ligne pour suivre le rayon de l'objet saisi

    const engine = new BABYLON.Engine(xrCanvas); // Création du moteur de rendu
    const scene = new BABYLON.Scene(engine); // Création de la scène

    // Constante pour le piano //
    const scale = 0.015;
    const keyboard = new BABYLON.TransformNode("keyboard");

    //Constructeur des touches du piano //
    const buildKey = function (scene, parent, props) {
        if (props.type === "white") {
    
            // Créer la partie basse
            const bottom = BABYLON.MeshBuilder.CreateBox("whiteKeyBottom", {width: props.bottomWidth, height: 1.5, depth: 4.5}, scene);
    
            // Crée la partie haute
            const top = BABYLON.MeshBuilder.CreateBox("whiteKeyTop", {width: props.topWidth, height: 1.5, depth: 5}, scene);
            top.position.z =  4.75;
            top.position.x += props.topPositionX;
    
            // Fusionne les deux parties
            const key = BABYLON.Mesh.MergeMeshes([bottom, top], true, false, null, false, false);
            key.position.x = props.referencePositionX + props.wholePositionX;
            key.name = props.note + props.register;
            key.parent = parent;
    
            return key;
        }
        else if (props.type === "black") {
    
            // Créer le matériau noir
            const blackMat = new BABYLON.StandardMaterial("black");
            blackMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    
            // Créer la touche noir
            const key = BABYLON.MeshBuilder.CreateBox(props.note + props.register, {width: 1.4, height: 2, depth: 5}, scene);
            key.position.z += 4.75;
            key.position.y += 0.25;
            key.position.x = props.referencePositionX + props.wholePositionX;
            key.material = blackMat;
            key.parent = parent;
    
            return key;
        }
    }

        // Paramètres des touches //
        const keyParams = [
            {type: "white", note: "C", topWidth: 1.4, bottomWidth: 2.3, topPositionX: -0.45, wholePositionX: -14.4},
            {type: "black", note: "C#", wholePositionX: -13.45},
            {type: "white", note: "D", topWidth: 1.4, bottomWidth: 2.4, topPositionX: 0, wholePositionX: -12},
            {type: "black", note: "D#", wholePositionX: -10.6},
            {type: "white", note: "E", topWidth: 1.4, bottomWidth: 2.3, topPositionX: 0.45, wholePositionX: -9.6},
            {type: "white", note: "F", topWidth: 1.3, bottomWidth: 2.4, topPositionX: -0.55, wholePositionX: -7.2},
            {type: "black", note: "F#", wholePositionX: -6.35},
            {type: "white", note: "G", topWidth: 1.3, bottomWidth: 2.3, topPositionX: -0.2, wholePositionX: -4.8},
            {type: "black", note: "G#", wholePositionX: -3.6},
            {type: "white", note: "A", topWidth: 1.3, bottomWidth: 2.3, topPositionX: 0.2, wholePositionX: -2.4},
            {type: "black", note: "A#", wholePositionX: -0.85},
            {type: "white", note: "B", topWidth: 1.3, bottomWidth: 2.4, topPositionX: 0.55, wholePositionX: 0},
        ]
    
        var referencePositionX = -2.4*14;
        for (let register = 1; register <= 7; register++) {
            keyParams.forEach(key => {
                buildKey(scene, keyboard, Object.assign({register: register, referencePositionX: referencePositionX}, key));
            })
            referencePositionX += 2.4*7;
        }
    
        buildKey(scene, keyboard, {type: "white", note: "A", topWidth: 1.9, bottomWidth: 2.3, topPositionX: -0.20, wholePositionX: -2.4, register: 0, referencePositionX: -2.4*21});
        keyParams.slice(10, 12).forEach(key => {
            buildKey(scene, keyboard, Object.assign({register: 0, referencePositionX: -2.4*21}, key));
        })
    
        buildKey(scene, keyboard, {type: "white", note: "C", topWidth: 2.3, bottomWidth: 2.3, topPositionX: 0, wholePositionX: -2.4*6, register: 8, referencePositionX: 84});
    
        // Pour donner la forme voulut au piano //
        const piano = new BABYLON.TransformNode("piano");
        keyboard.parent = piano;
    
        BABYLON.SceneLoader.ImportMesh("frame", "https://raw.githubusercontent.com/MicrosoftDocs/mixed-reality/docs/mixed-reality-docs/mr-dev-docs/develop/javascript/tutorials/babylonjs-webxr-piano/files/", "pianoFrame.babylon", scene, function(meshes) {
            const frame = meshes[0];
            frame.parent = piano;
        });
    
        keyboard.position.y += 80;
    
        // Fonction pour changer l'échelle d'un objet à partir d'un point pivot //
        const scaleFromPivot = function(transformNode, pivotPoint, scale) {
            const _sx = scale / transformNode.scaling.x;
            const _sy = scale / transformNode.scaling.y;
            const _sz = scale / transformNode.scaling.z;
            transformNode.scaling = new BABYLON.Vector3(_sx, _sy, _sz); 
            transformNode.position = new BABYLON.Vector3(pivotPoint.x + _sx * (transformNode.position.x - pivotPoint.x), pivotPoint.y + _sy * (transformNode.position.y - pivotPoint.y), pivotPoint.z + _sz * (transformNode.position.z - pivotPoint.z));
        }
    
        scaleFromPivot(piano, new BABYLON.Vector3(0, 0, 0), scale);
    
        const pointerToKey = new Map()
        const pianoSound = await Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano');

        // Gestion des événements PointerDown et PointerUp
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    // Faire une action seulement si le pointeur est sur une touche
                    if(pointerInfo.pickInfo.hit) {
                        let pickedMesh = pointerInfo.pickInfo.pickedMesh;
                        let pointerId = pointerInfo.event.pointerId;
                        if (pickedMesh.parent === keyboard) {
                            pickedMesh.position.y -= 0.5;
                            pointerToKey.set(pointerId, {
                                mesh: pickedMesh,
                                note: pianoSound.play(pointerInfo.pickInfo.pickedMesh.name)
                            });
                        }
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    let pointerId = pointerInfo.event.pointerId;
                    // Ne faire une action que si le pointeur était sur une touche
                    if (pointerToKey.has(pointerId)) {
                        pointerToKey.get(pointerId).mesh.position.y += 0.5;
                        pointerToKey.get(pointerId).note.stop();
                        pointerToKey.delete(pointerId);
                    }
                    break;
            }
        });

        //activer colision pour le piano
        piano.checkCollisions = true;

    // Sons pour les murs //

    var soundDo = new BABYLON.Sound("wallDoSound", "./sound/do.wav", scene);
    var soundRe = new BABYLON.Sound("wallReSound", "./sound/re.wav", scene);
    var soundMi = new BABYLON.Sound("wallMiSound", "./sound/mi.wav", scene);
    var soundFa = new BABYLON.Sound("wallFaSound", "./sound/fa.wav", scene);
    var soundSol = new BABYLON.Sound("wallSolSound", "./sound/sol.wav", scene);
    var soundLa = new BABYLON.Sound("wallLaSound", "./sound/la.wav", scene);
    var soundSi = new BABYLON.Sound("wallSiSound", "./sound/si.wav", scene);
    var soundDo2 = new BABYLON.Sound("wallDoSound", "./sound/do2.wav", scene);
    var soundMi2 = new BABYLON.Sound("wallReSound", "./sound/mi2.wav", scene);
    var soundSol2 = new BABYLON.Sound("wallMiSound", "./sound/sol2.wav", scene);
    var soundSi2 = new BABYLON.Sound("wallFaSound", "./sound/si2.wav", scene);
    var soundLa2 = new BABYLON.Sound("wallSolSound", "./sound/la2.wav", scene);

    soundDo.setVolume(0.5);
    soundRe.setVolume(0.5);
    soundMi.setVolume(0.5);
    soundFa.setVolume(0.5);
    soundSol.setVolume(0.5);
    soundLa.setVolume(0.5);
    soundSi.setVolume(0.5);
    soundDo2.setVolume(0.5);
    soundMi2.setVolume(0.5);
    soundSol2.setVolume(0.5);
    soundSi2.setVolume(0.5);
    soundLa2.setVolume(0.5);
    
    // Caméra
    var camera = new BABYLON.UniversalCamera("vrCam", new BABYLON.Vector3(0, 2, -1.5), scene);
    camera.attachControl(xrCanvas, true);

     // Lumière
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Physics et Gravité
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0); //Défini la gravité de la scène
    var physicsPlugin = new BABYLON.CannonJSPlugin(); //Défini le plugin de physique
    scene.enablePhysics(gravityVector, physicsPlugin); //Active la physique dans la scène
        
    // Environnement
    var environment = scene.createDefaultEnvironment({ enableGroundShadow: true });
    environment.setMainColor(BABYLON.Color3.FromHexString("#74b9ff"))
    environment.ground.parent.position.y = 0;
    environment.ground.position.y = 0
      
    // Variables pour la construction d'une salle
    var x = 3; 
    var y = 3; 
    var heightWall = x*2; // hauteur des murs
    
    // SOL
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: x*2, height: x*2}, scene); // création du sol
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
      
    // MURS
    var wallDo = BABYLON.MeshBuilder.CreateBox("wallDo", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallDo.position.z = x;
    wallDo.position.y = y;
    wallDo.position.x = -2;
    wallDo.material = new BABYLON.StandardMaterial("wallDo", scene);
    wallDo.material.diffuseColor = new BABYLON.Color3(0, 0, 0); // noir
    wallDo.physicsImpostor = new BABYLON.PhysicsImpostor(wallDo, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallRe = BABYLON.MeshBuilder.CreateBox("wallRe", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallRe.position.z = x;
    wallRe.position.y = y;
    wallRe.position.x = 0;
    wallRe.material = new BABYLON.StandardMaterial("wallRe", scene);
    wallRe.material.diffuseColor = new BABYLON.Color3(0.5, 0.25, 0); // marron
    wallRe.physicsImpostor = new BABYLON.PhysicsImpostor(wallRe, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallMi = BABYLON.MeshBuilder.CreateBox("wallMi", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallMi.position.z = x;
    wallMi.position.y = y;
    wallMi.position.x = 2;
    wallMi.material = new BABYLON.StandardMaterial("wallMi", scene);
    wallMi.material.diffuseColor = new BABYLON.Color3(1, 0, 1); // violet
    wallMi.physicsImpostor = new BABYLON.PhysicsImpostor(wallMi, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallFa = BABYLON.MeshBuilder.CreateBox("wallFa", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallFa.position.x = -x;
    wallFa.position.y = y;
    wallFa.position.z = -2;
    wallFa.material = new BABYLON.StandardMaterial("wallFa", scene);
    wallFa.material.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // orange
    wallFa.physicsImpostor = new BABYLON.PhysicsImpostor(wallFa, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallSol = BABYLON.MeshBuilder.CreateBox("wallSol", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallSol.position.x = -x;
    wallSol.position.y = y;
    wallSol.position.z = 0;
    wallSol.material = new BABYLON.StandardMaterial("wallSol", scene);
    wallSol.material.diffuseColor = new BABYLON.Color3(1, 1, 0); // jaune
    wallSol.physicsImpostor = new BABYLON.PhysicsImpostor(wallSol, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallLa = BABYLON.MeshBuilder.CreateBox("wallLa", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallLa.position.z = -x;
    wallLa.position.y = y;
    wallLa.position.x = -2;
    wallLa.material = new BABYLON.StandardMaterial("wallLa", scene);
    wallLa.material.diffuseColor = new BABYLON.Color3(0, 1, 0); // vert
    wallLa.physicsImpostor = new BABYLON.PhysicsImpostor(wallLa, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallSi = BABYLON.MeshBuilder.CreateBox("wallSi", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallSi.position.z = -x;
    wallSi.position.y = y;
    wallSi.position.x = 0;
    wallSi.material = new BABYLON.StandardMaterial("wallSi", scene);
    wallSi.material.diffuseColor = new BABYLON.Color3(0, 1, 1); // cyan
    wallSi.physicsImpostor = new BABYLON.PhysicsImpostor(wallSi, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallDo2 = BABYLON.MeshBuilder.CreateBox("wallDo2", {width: x*2/3, height: heightWall, depth: 0.1}, scene);
    wallDo2.position.z = -x;
    wallDo2.position.y = y;
    wallDo2.position.x = 2;
    wallDo2.material = new BABYLON.StandardMaterial("wallDo2", scene);
    wallDo2.material.diffuseColor = new BABYLON.Color3(0, 0, 1); // bleu
    wallDo2.physicsImpostor = new BABYLON.PhysicsImpostor(wallDo2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallDoRe = BABYLON.MeshBuilder.CreateBox("wallDoRe", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallDoRe.position.x = x;
    wallDoRe.position.y = y;
    wallDoRe.position.z = -2;
    wallDoRe.material = new BABYLON.StandardMaterial("wallDoRe", scene);
    wallDoRe.material.diffuseColor = new BABYLON.Color3(1, 0, 0.5); // rose
    wallDoRe.physicsImpostor = new BABYLON.PhysicsImpostor(wallDoRe, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallReMi = BABYLON.MeshBuilder.CreateBox("wallReMi", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallReMi.position.x = x;
    wallReMi.position.y = y;
    wallReMi.position.z = 0;
    wallReMi.material = new BABYLON.StandardMaterial("wallReMi", scene);
    wallReMi.material.diffuseColor = new BABYLON.Color3(1, 1, 1);  // blanc
    wallReMi.physicsImpostor = new BABYLON.PhysicsImpostor(wallReMi, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
    var wallMiFa = BABYLON.MeshBuilder.CreateBox("wallMiFa", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallMiFa.position.x = x;
    wallMiFa.position.y = y;
    wallMiFa.position.z = 2;
    wallMiFa.material = new BABYLON.StandardMaterial("wallMiFa", scene);
    wallMiFa.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // gris
    wallMiFa.physicsImpostor = new BABYLON.PhysicsImpostor(wallMiFa, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
        
    var wallFaSol = BABYLON.MeshBuilder.CreateBox("wallFaSol", {width: 0.1, height: heightWall, depth: x*2/3}, scene);
    wallFaSol.position.x = -x;
    wallFaSol.position.y = y;
    wallFaSol.position.z = 2;
    wallFaSol.physicsImpostor = new BABYLON.PhysicsImpostor(wallFaSol, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
     
    //Plaque pour quitter la vr
    var vrExit = BABYLON.MeshBuilder.CreateBox("vrExit", {width: 0.1, height: 0.1, depth: 0.1}, scene);
    vrExit.position.x = 0;
    vrExit.position.y = 3;
    vrExit.position.z = 0;

    vrExit.physicsImpostor = new BABYLON.PhysicsImpostor(vrExit, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9}, scene);
    vrExit.checkCollisions = true;
    vrExit.isPickable = true;
    vrExit.isVisible = false;


    //OBJETS//
        
    // CREATION SPHERE
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5}, scene); // création de la sphère
    sphere.position.y = 1;
    sphere.position.x = 2;
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.9}, scene);

    sphere.checkCollisions = true;
    sphere.isGrabbable = true;
    sphere.isPickable = true;

        
    // CREATION D'UNE BOITE
    var box = BABYLON.MeshBuilder.CreateBox("box", {height: 0.5, width: 0.5, depth: 0.5}, scene); // création de la boîte
    box.position.y = 1;
    box.position.x = 2;
    box.position.z = 1;
    box.material = new BABYLON.StandardMaterial("box", scene); // création d'un matériau pour la boîte (TEXTURE)
    box.material.diffuseColor = new BABYLON.Color3(0, 0, 1); // couleur de la boîte (défini plus haut)

    box.checkCollisions = true;
    box.isGrabbable = true;

    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0.9}, scene); 
    
    // Création du cylindre
    cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", { height: 0.7, diameter: 0.1 });
    cylinder.isVisible = false; // Le cylindre est initialement invisible
    cylinder.isGrabbable = false;
    cylinder.position.y = 0;
    cylinder.position.x = 0;
    cylinder.position.z = 0;
    cylinder.checkCollisions = true;
    cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(cylinder, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0.9 }, scene);

    // Création du son


    // *************** COLLISIONS **************** //
    
    // SPHERES

    sphere.physicsImpostor.registerOnPhysicsCollide(wallRe.physicsImpostor, function(main, collided) {soundRe.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallMi.physicsImpostor, function(main, collided) {soundMi.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallFa.physicsImpostor, function(main, collided) {soundFa.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallSol.physicsImpostor, function(main, collided) {soundSol.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallLa.physicsImpostor, function(main, collided) {soundLa.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallSi.physicsImpostor, function(main, collided) {soundSi.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallDo2.physicsImpostor, function(main, collided) {soundDo2.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallDo.physicsImpostor, function(main, collided) {soundDo.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallMiFa.physicsImpostor, function(main, collided) {soundSi.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallDoRe.physicsImpostor, function(main, collided) {soundLa2.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallReMi.physicsImpostor, function(main, collided) {soundMi2.play();});
    sphere.physicsImpostor.registerOnPhysicsCollide(wallFaSol.physicsImpostor, function(main, collided) {soundSol2.play();});
    
    ground.checkCollisions = true;
    wallRe.checkCollisions = true;
    wallMi.checkCollisions = true;
    wallFa.checkCollisions = true;
    wallSol.checkCollisions = true;
    wallLa.checkCollisions = true;
    wallSi.checkCollisions = true;
    wallDo2.checkCollisions = true;
    wallDo.checkCollisions = true;
    wallDoRe.checkCollisions = true;
    wallReMi.checkCollisions = true;
    wallMiFa.checkCollisions = true;
    wallFaSol.checkCollisions = true;

 // Propriétés Projectile 
    var fireRate = 100; // temps entre chaque tir
    var fireRateCounter = 0; // temps écoulé depuis le dernier tir
    var sphereSize = 0.2; // taille des sphères
    var sphereSpeed = 20; // vitesse des sphères
    var sphereLife = 3; // durée de vie des sphères
    var sphereColor = new BABYLON.Color3(1, 0, 0); // couleur des sphères
    
    //tirer des spheres si on appuie sur la touche espace
    scene.actionManager = new BABYLON.ActionManager(scene);

    if(!vrMode){
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function(evt) {
            if (evt.sourceEvent.key === " ") {
                var tmp_sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: sphereSize}, scene);
                tmp_sphere.position = box.position.clone();
                tmp_sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
                tmp_sphere.material.diffuseColor = sphereColor;

                tmp_sphere.physicsImpostor = new BABYLON.PhysicsImpostor(tmp_sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.9}, scene);
                tmp_sphere.checkCollisions = true;
                var forceDirection = new BABYLON.Vector3(0, 0, 1);
                var forceMagnitude = -sphereSpeed + (-sphereSpeed * Math.random());

                //collision entre sphere et mur
    
                tmp_sphere.physicsImpostor.applyImpulse(forceDirection.scale(forceMagnitude), sphere.getAbsolutePosition());
    
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallRe.physicsImpostor, function(main, collided) {soundRe.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallMi.physicsImpostor, function(main, collided) {soundMi.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallFa.physicsImpostor, function(main, collided) {soundFa.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallSol.physicsImpostor, function(main, collided) {soundSol.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallLa.physicsImpostor, function(main, collided) {soundLa.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallSi.physicsImpostor, function(main, collided) {soundSi.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallDo2.physicsImpostor, function(main, collided) {soundDo2.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallDo.physicsImpostor, function(main, collided) {soundDo.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallMiFa.physicsImpostor, function(main, collided) {soundSi.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallDoRe.physicsImpostor, function(main, collided) {soundLa2.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallReMi.physicsImpostor, function(main, collided) {soundMi2.play();});
                tmp_sphere.physicsImpostor.registerOnPhysicsCollide(wallFaSol.physicsImpostor, function(main, collided) {soundSol2.play();});
                tmp_sphere.physicsImpostor.applyImpulse(forceDirection.scale(forceMagnitude), sphere.getAbsolutePosition());
                setTimeout(function() {
                    tmp_sphere.dispose();
                }, sphereLife * 2000);
            }
            
        }));
    }

    // Constantes


    const SMOOTH_FACTOR = 0.2;
    const MAX_DISTANCE = 1;
    const LAUNCH_FORCE = 10;

    //Fonction pour tirer une sphere
    function shootSphere(controller, scene) {

        //Création sphère + physics
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.1 }, scene);
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 }, scene);

        // Position de la sphère (Source du tir)
        const controllerPosition = controller.pointer.position.clone(); // position du controller
        const controllerDirection = controller.pointer.forward.clone(); // direction du controller
        const sphereLaunchPosition = controllerPosition.add(controllerDirection.scale(0.1)); //
        sphere.position.copyFrom(sphereLaunchPosition); 

        // Direction du tir
        const force = controllerDirection.scale(LAUNCH_FORCE);
        sphere.physicsImpostor.applyImpulse(force, sphere.getAbsolutePosition());

        // Collision entre la sphère et les murs (+Sons)
        sphere.physicsImpostor.registerOnPhysicsCollide(wallRe.physicsImpostor, function(main, collided) {soundRe.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallMi.physicsImpostor, function(main, collided) {soundMi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallFa.physicsImpostor, function(main, collided) {soundFa.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallSol.physicsImpostor, function(main, collided) {soundSol.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallLa.physicsImpostor, function(main, collided) {soundLa.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallSi.physicsImpostor, function(main, collided) {soundSi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDo2.physicsImpostor, function(main, collided) {soundDo2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDo.physicsImpostor, function(main, collided) {soundDo.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallMiFa.physicsImpostor, function(main, collided) {soundSi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDoRe.physicsImpostor, function(main, collided) {soundLa2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallReMi.physicsImpostor, function(main, collided) {soundMi2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallFaSol.physicsImpostor, function(main, collided) {soundSol2.play();});

        setTimeout(() => {} , 1000);
        // Supprimer la sphère au bout de 1 secondes
        setTimeout(() => {
            sphere.dispose();
        }, 1000);
    }

    // Tirer une sphère avec la gachette
    function handleSphereShooting(controller, component, scene) {
        if (component.pressed) {

            shootSphere(controller, scene);
        }
    }

    function dropObject(controller, object, launch = false) {
        if (object.grabbed) {
            object.grabbed = false;
            object.physicsImpostor.setMass(1);

            if (launch) {
                const forceDirection = controller.pointer.forward;
                const velocity = forceDirection.scale(LAUNCH_FORCE); // Calculez la vélocité au lieu de l'impulsion
                object.physicsImpostor.setLinearVelocity(velocity); // Appliquez la vélocité
            }
        }
    }

    // Fonction pour ramasser le cylindre avec le contrôleur
    function activateMeleeObject(controller, object) {
        if(!meleeMode){
            object.isVisible = true;
            object.checkCollisions = true;
            object.physicsImpostor.setMass(0);
            meleeMode = true;
        }
        object.position.copyFrom(controller.pointer.position);
        object.rotationQuaternion.copyFrom(controller.rotationQuaternion);
        
    }

    //Créer une sphère 
    function createSphere(scene, diameter) {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: diameter }, scene);
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 }, scene);

        sphere.isGrabbable = true;
        sphere.isPickable = true;
        sphere.checkCollisions = true;
        sphere.physicsImpostor.registerOnPhysicsCollide(wallRe.physicsImpostor, function(main, collided) {soundRe.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallMi.physicsImpostor, function(main, collided) {soundMi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallFa.physicsImpostor, function(main, collided) {soundFa.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallSol.physicsImpostor, function(main, collided) {soundSol.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallLa.physicsImpostor, function(main, collided) {soundLa.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallSi.physicsImpostor, function(main, collided) {soundSi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDo2.physicsImpostor, function(main, collided) {soundDo2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDo.physicsImpostor, function(main, collided) {soundDo.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallMiFa.physicsImpostor, function(main, collided) {soundSi.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallDoRe.physicsImpostor, function(main, collided) {soundLa2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallReMi.physicsImpostor, function(main, collided) {soundMi2.play();});
        sphere.physicsImpostor.registerOnPhysicsCollide(wallFaSol.physicsImpostor, function(main, collided) {soundSol2.play();});


        //crée une sphère avec une couleur aléatoire
        const sphereColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
        sphere.material.diffuseColor = sphereColor;

        sphere.position.x = 1;
        sphere.position.y = 1;
        sphere.position.z = 1;

    }

    // Fonction pour relâcher le cylindre
    function desactivateMeleeObject(object) {
        object.isVisible = false;
        object.checkCollisions = false;
        meleeMode = false;
    }

    // Fonction pour entrer en VR
    async function initVRMode() {
        try {
            vrMode = true; // On passe en mode VR
            var xr = await scene.createDefaultXRExperienceAsync({ // On crée l'expérience VR
                    floorMeshes: [environment.ground]}); // On définit le sol de la scène comme étant le sol de la VR 

            //Activer la vue VR 
            xr.baseExperience.enterXRAsync('immersive-vr', 'local-floor').then(() => {
            // On entre en VR
            }).catch((err) => {
            // On ne peut pas entrer en VR

            });

            var origin = camera.position;

            //position et direction de box
            var pos_box = box.position;
            var direction_box = pos_box.subtract(origin);

            //position et direction de sphere
            var pos_sphere = sphere.position;
            var direction_sphere = pos_sphere.subtract(origin);

            //rayons object
            var ray_box = new BABYLON.Ray(origin, direction_box, 100);
            var ray_sphere = new BABYLON.Ray(origin, direction_sphere, 100);

            xr.input.onControllerAddedObservable.add((controller) => {
                let moveInterval; // Déclarez moveInterval en dehors de la portée de la fonction pour y accéder dans tout le bloc.
    
                scene.onPointerObservable.add((pointerInfo) => {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh.isGrabbable) {
                                pointerInfo.pickInfo.pickedMesh.grabbed = true;
                                pointerInfo.pickInfo.pickedMesh.physicsImpostor.setMass(0);
            
                                if (moveInterval === null) {
                                    moveInterval = setInterval(() => {
                                        pointerInfo.pickInfo.pickedMesh.position.copyFrom(controller.pointer.position);
                                        pointerInfo.pickInfo.pickedMesh.rotationQuaternion.copyFrom(controller.rotationQuaternion);
                                    }, 20);
                                }
                            }
                            break;
                        case BABYLON.PointerEventTypes.POINTERUP:
                            if (pointerInfo.pickInfo.pickedMesh.grabbed) {
                                clearInterval(moveInterval); // Arrêter l'intervalle
                                moveInterval = null;
                                dropObject(controller, pointerInfo.pickInfo.pickedMesh, true);
                            }
                            break;
                    }
                });

                controller.onMotionControllerInitObservable.add((motionController) => {
                // Mannette Gauche
                    if (motionController.handness === 'left') {
                        const xr_ids = motionController.getComponentIds();
    
                    // Trigger (Gachette haute)
                        let triggerComponent = motionController.getComponent(xr_ids[0]);
                        triggerComponent.onButtonStateChangedObservable.add(() => {
                        if (triggerComponent.pressed) {} 
                        else {}
                        });
    
                    // Squeeze (Gachette basse)
                    let squeezeComponent = motionController.getComponent(xr_ids[1]);
                    squeezeComponent.onButtonStateChangedObservable.add(() => {
                        if(squeezeComponent.pressed) {
                        }
                    }
                    );


                    // Joystick (appuyé)
                        let thumbstickComponent = motionController.getComponent(xr_ids[2]);
                        thumbstickComponent.onButtonStateChangedObservable.add(() => {
                        if (thumbstickComponent.pressed) {}
                        else{}
                        });

                    // Joystick (bougé)
                        thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
                    });
        
                    // Bouton X
                        let xbuttonComponent = motionController.getComponent(xr_ids[3]);
                        xbuttonComponent.onButtonStateChangedObservable.add(() => {
                        if (xbuttonComponent.pressed) {
                            createSphere(scene, 0.5);
                        }
                        else{}
                        });
    
                // Bouton Y
                        let ybuttonComponent = motionController.getComponent(xr_ids[4]);
                        ybuttonComponent.onButtonStateChangedObservable.add(() => {
                        if (ybuttonComponent.pressed) {}
                        else{}
                        });
                    
                    }
                    // Mannette droite
                    if (motionController.handness === 'right') {
                        const xr_ids = motionController.getComponentIds();
    
                    // Trigger (Gachette haute)
                        let triggerComponent = motionController.getComponent(xr_ids[0]);
                        triggerComponent.onButtonStateChangedObservable.add(() => {
                        if (triggerComponent.pressed) {}
                        else{}
                        });
    
                    // Squeeze (Gachette basse)
                        let squeezeComponent = motionController.getComponent(xr_ids[1]);
                        squeezeComponent.onButtonStateChangedObservable.add(() => {
                        handleSphereShooting(controller, squeezeComponent, scene);
                        /*if (squeezeComponent.pressed) {}}
                        else{}*/
                    });

                    // Joystick (appuyé)
                        let thumbstickComponent = motionController.getComponent(xr_ids[2]);
                        thumbstickComponent.onButtonStateChangedObservable.add(() => {
                        if (thumbstickComponent.pressed) {}
                        else{}
                        });
                    // Joystick (bougé)
                        thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
                        });
        
                    // Bouton A
                        let abuttonComponent = motionController.getComponent(xr_ids[3]);
                        abuttonComponent.onButtonStateChangedObservable.add(() => {
                    
                            let actionMeleeInterval = null; // Identifiant de l'intervalle d'action

                        // Événement pour chaque trame
                        scene.onBeforeRenderObservable.add(() => {
                            if (abuttonComponent.pressed) {
                                // Si le bouton est enfonc
                                if(actionMeleeInterval === null) {                                    
                                    actionMeleeInterval = setInterval(() => {
                                        activateMeleeObject(controller, cylinder);
                                    }, 20); // Exécuter l'action toutes les 10 ms}
                                }
                            }
                            else {
                                clearInterval(actionMeleeInterval); // Arrêter l'action
                                actionMeleeInterval = null;
                                desactivateMeleeObject(cylinder);
                            }
                        
                        });
                        });

                    // Bouton B
                        let bbuttonComponent = motionController.getComponent(xr_ids[4]);
                        bbuttonComponent.onButtonStateChangedObservable.add(() => {
                        if (bbuttonComponent.pressed) {}
                        else{}
                        });
                    }   
                })          
            });
        } catch (err) {
            console.log(err);
        }
    }

    async function exitVRMode() {
        if (xrSession) {
            await xrSession.end();
            xrSession = null;
            startButton.innerText = 'Démarrer la VR';
            vrMode = false;
        }
    }

    startButton.addEventListener('click', () => {
        if (!vrMode) {
            initVRMode();
        } else {
            exitVRMode();
        }
    });

    // Démarrez la scène en mode non-VR par défaut
    engine.runRenderLoop(() => {
        scene.render();
    });
});