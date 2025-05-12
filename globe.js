// Globe class to handle the 3D globe creation and interaction
class Globe {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.globe = null;
    this.atmosphere = null;
    this.userMarker = null;
    this.userLocation = null;
    this.texturesLoaded = 0;
    this.totalTextures = 2;
    this.isInitialized = false;
    this.earthTexture = null;
    this.displacementMap = null;
  }

  // Initialize the 3D scene
  init() {
    console.log("Initializing globe...");
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 3;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    // Add orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    
    // Create the globe
    this.createGlobe();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
    
    this.isInitialized = true;
    console.log("Globe initialized");
  }

  // Create the globe with textures
  createGlobe() {
    console.log("Creating globe...");
    
    // Create a group for the globe
    const globeGroup = new THREE.Group();
    this.scene.add(globeGroup);
    
    // Create atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(this.atmosphere);
    
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    console.log("Loading textures...");
    
    // Earth texture (grayscale)
    textureLoader.load(
      'earth-grayscale.png', 
      (texture) => {
        console.log("Earth texture loaded");
        this.earthTexture = texture;
        this.textureLoaded();
      },
      (progress) => {
        console.log(`Earth texture loading: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error("Error loading earth texture:", error);
        app.showError("Failed to load earth texture. Please try refreshing the page.");
      }
    );
    
    // Displacement map
    textureLoader.load(
      'earth-displacement.png',
      (texture) => {
        console.log("Displacement map loaded");
        this.displacementMap = texture;
        this.textureLoaded();
      },
      (progress) => {
        console.log(`Displacement map loading: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error("Error loading displacement map:", error);
        app.showError("Failed to load displacement map. Please try refreshing the page.");
      }
    );
  }

  // Handle texture loading completion
  textureLoaded() {
    this.texturesLoaded++;
    console.log(`Textures loaded: ${this.texturesLoaded}/${this.totalTextures}`);
    
    if (this.texturesLoaded === this.totalTextures) {
      console.log("All textures loaded, creating globe mesh");
      
      // Create the globe
      const globeGeometry = new THREE.SphereGeometry(1, 128, 128);
      const globeMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        map: this.earthTexture,
        displacementMap: this.displacementMap,
        displacementScale: 0.05,
        roughness: 0.8,
        metalness: 0.2,
        emissive: 0x111111,
        emissiveIntensity: 0.1
      });
      
      this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
      this.scene.children[0].add(this.globe);
      
      // Hide loading screen when globe is ready
      document.getElementById('loading').style.display = 'none';
      console.log("Globe created and loading screen hidden");
    }
  }

  // Convert latitude and longitude to 3D position
  latLongToVector3(lat, long, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  }

  // Add user location marker to the globe
  addUserLocationMarker(lat, long) {
    console.log(`Adding marker at lat: ${lat}, long: ${long}`);
    
    // Remove existing marker if any
    if (this.userMarker) {
      this.scene.remove(this.userMarker);
    }
    
    // Create marker group
    this.userMarker = new THREE.Group();
    
    // Calculate position
    const position = this.latLongToVector3(lat, long, 1.01);
    this.userMarker.position.copy(position);
    
    // Create marker
    const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    
    this.userMarker.add(marker);
    this.scene.add(this.userMarker);
    console.log("User marker added");
  }

  // Focus camera on user location
  focusOnUserLocation() {
    if (this.userLocation && this.controls) {
      console.log("Focusing on user location");
      
      const targetPosition = this.latLongToVector3(
        this.userLocation.latitude, 
        this.userLocation.longitude, 
        3
      );
      
      // Disable auto-rotation during focus animation
      const wasAutoRotating = this.controls.autoRotate;
      this.controls.autoRotate = false;
      
      // Animate camera position
      const startPosition = this.camera.position.clone();
      const duration = 1000; // ms
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Move camera
        this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        // Look at the center
        this.camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          // Re-enable auto-rotation if it was enabled before
          this.controls.autoRotate = wasAutoRotating;
        }
      };
      
      animateCamera();
    } else {
      console.log("Cannot focus: user location not available");
      app.showError("User location not available. Please allow location access and try again.");
    }
  }

  // Handle window resize
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Animation loop
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Rotate atmosphere
    if (this.atmosphere) {
      this.atmosphere.rotation.y += 0.0005;
    }
    
    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}