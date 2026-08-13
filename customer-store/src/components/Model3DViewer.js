import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { PlayArrow, Pause, ThreeSixty } from '@mui/icons-material';

// Enable global caching for Three.js so models load instantaneously from memory when switching
THREE.Cache.enabled = true;

const Model3DViewer = forwardRef(({ 
  modelUrl, 
  hairModelUrl, 
  clothingModelUrl, 
  width = '100%', 
  height = 600, 
  productColor = 'White', 
  productCategory = 'shirt', 
  showColorPicker = true, 
  showControls = true, 
  autoRotate = true, 
  onColorChange,
  // Avatar customization props
  initialSkinTone,
  initialHairColor,
  initialEyeColor,
  applyAvatarCustomization = false
}, ref) => {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const hairRef = useRef(null);
  const clothingRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const pivotGroupRef = useRef(null); // Single group that holds avatar + clothing — rotated as one unit
  const avatarBoundsRef = useRef(null); // Avatar bounds stored at load time (pivotGroup rotation=0)
  const productColorRef = useRef(productColor); // Always holds the LATEST productColor prop (avoids stale closure)
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isAutoRotating, setIsAutoRotating] = React.useState(autoRotate);
  const isAutoRotatingRef = useRef(autoRotate); // Ref to avoid stale closure in animate loop
  const [selectedColor, setSelectedColor] = React.useState(productColor);
  const [containerSize, setContainerSize] = React.useState({ width: 400, height: 600 });

  // Available colors for the product
  const availableColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#DC143C' },
    { name: 'Blue', hex: '#4169E1' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Green', hex: '#228B22' },
    { name: 'Yellow', hex: '#FFD700' },
    { name: 'Pink', hex: '#FF69B4' },
    { name: 'Purple', hex: '#9370DB' },
    { name: 'Orange', hex: '#FF8C00' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Brown', hex: '#8B4513' },
  ];

  useEffect(() => {
    if (!modelUrl) {
      setError('No 3D model URL provided');
      setLoading(false);
      return;
    }

    // Calculate responsive dimensions
    const calculateDimensions = () => {
      if (mountRef.current) {
        const containerWidth = typeof width === 'number' ? width : mountRef.current.offsetWidth || 400;
        const containerHeight = typeof height === 'number' ? height : 600;
        setContainerSize({ width: containerWidth, height: containerHeight });
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);

    // Check if this is an avatar/mannequin (declare once and reuse)
    const isAvatar = (productCategory || '').toLowerCase().includes('avatar') || 
                     (productCategory || '').toLowerCase().includes('mannequin');

    // Scene setup
    const scene = new THREE.Scene();
    // Gradient-like background using fog for better product visibility
    scene.background = new THREE.Color(0x1a1a1a); // Dark gray instead of pure black
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50); // Subtle gradient effect

    // Create a shared pivot group — avatar AND clothing are children of this group.
    // Rotating the group guarantees clothing is always glued to the avatar's front.
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    pivotGroupRef.current = pivotGroup;

    // Camera setup - position camera to look at model from front
    const camera = new THREE.PerspectiveCamera(
      60, // Even wider field of view to show full body
      containerSize.width / containerSize.height,
      0.1,
      1000
    );
    
    // For avatars, position camera further back and lower to show full body from head to toe
    if (isAvatar) {
      camera.position.set(0, 0, 12); // Much further back to show full body
    } else {
      camera.position.set(0, 0, 7); // Default for products
    }
    
    camera.lookAt(0, 0, 0); // Look at center of model

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance', // Use GPU acceleration
      precision: 'mediump', // Reduce precision for better performance
    });
    renderer.setSize(containerSize.width, containerSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = false; // Disable shadows for better performance
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Enhanced Lighting (optimized)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(5, 10, 7.5);
    directionalLight1.castShadow = false; // Disable shadows for performance
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Removed extra lights for performance (directionalLight3, rimLight, ground plane)

    // Controls - restrict to horizontal rotation only (like a turntable)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Adjust control limits for avatars vs products
    if (isAvatar) {
      controls.minDistance = 8;   // Allow closer zoom for avatars
      controls.maxDistance = 25;  // Allow much further zoom out
    } else {
      controls.minDistance = 4;
      controls.maxDistance = 15;
    }
    
    // Lock vertical rotation - keep camera at same height
    controls.minPolarAngle = Math.PI / 2; // Horizontal
    controls.maxPolarAngle = Math.PI / 2; // Horizontal
    
    controls.autoRotate = false; // We rotate the model group directly in the animate loop for smooth performance
    controls.enablePan = false; // Disable panning
    controls.target.set(0, 0, 0); // Rotate around center of model
    
    // Disable user rotation if autoRotate is false (for product grids)
    if (!autoRotate) {
      controls.enableRotate = false; // Disable drag to rotate
      controls.enableZoom = false; // Disable scroll to zoom
    }
    
    controlsRef.current = controls;

    // Load 3D model - detect file type and use appropriate loader
    let fullModelUrl;
    if (modelUrl.startsWith('http')) {
      fullModelUrl = modelUrl;
    } else if (modelUrl.startsWith('/')) {
      fullModelUrl = `http://localhost:8082${modelUrl}`;
    } else {
      // If no leading slash, add it
      fullModelUrl = `http://localhost:8082/${modelUrl}`;
    }

    // Detect file extension
    const fileExtension = modelUrl.toLowerCase().split('.').pop();
    const isFBX = fileExtension === 'fbx';
    const isOBJ = fileExtension === 'obj';
    const isGLB = fileExtension === 'glb' || fileExtension === 'gltf';
    
    console.log('Loading 3D model:', { modelUrl, fullModelUrl, fileExtension, isFBX, isOBJ, isGLB });

    // Function to process loaded model
    const processLoadedModel = (object) => {
      // Get initial dimensions
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      
      console.log('=== MODEL ROTATION DEBUG ===');
      console.log('Model dimensions before rotation:', { x: size.x, y: size.y, z: size.z });
      console.log('Product category received:', productCategory);
      console.log('Product category type:', typeof productCategory);
      
      // Auto-detect if 3D model was exported with Z-up (e.g. Blender OBJ models like shirts/pants/suits) vs Y-up
      const isZUp = size.z > size.y;
      const category = (productCategory || 'shirt').toLowerCase();
      
      if (category.includes('avatar') || category.includes('mannequin')) {
        // AVATAR/MANNEQUIN
        object.rotation.x = isZUp ? Math.PI / 2 : 0;
        object.rotation.y = 0;
        object.rotation.z = 0;
        console.log(`✅ Applied AVATAR rotation (isZUp=${isZUp})`);
      } else {
        // PRODUCTS (Shirts, Pants, Suits, Dresses, Tops, Jackets, etc.)
        object.rotation.x = isZUp ? Math.PI / 2 : 0;
        object.rotation.y = Math.PI; // Rotate 180° to face front towards camera
        object.rotation.z = 0;
        console.log(`✅ Applied PRODUCT rotation for '${category}' (isZUp=${isZUp}, X=${object.rotation.x}, Y=${object.rotation.y})`);
      }
      
      // Update matrix after rotation
      object.updateMatrixWorld(true);
      
      // Recalculate bounding box after rotation
      const rotatedBox = new THREE.Box3().setFromObject(object);
      const rotatedSize = rotatedBox.getSize(new THREE.Vector3());
      const rotatedCenter = rotatedBox.getCenter(new THREE.Vector3());
      
      console.log('Model dimensions after rotation:', { x: rotatedSize.x, y: rotatedSize.y, z: rotatedSize.z });
      
      // Scale to fit viewport - make smaller to show full product
      const maxDim = Math.max(rotatedSize.x, rotatedSize.y, rotatedSize.z);
      
      // For avatars, use more aggressive scaling to show full body
      const scale = isAvatar ? (3.5 / maxDim) : (2.5 / maxDim); // Larger scale for avatars
      
      object.scale.multiplyScalar(scale);
      
      // Center the model at origin
      object.position.set(
        -rotatedCenter.x * scale,
        -rotatedCenter.y * scale,
        -rotatedCenter.z * scale
      );
      
      // Apply enhanced material with better appearance
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Properly dispose of old material if it exists
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
          
          // Create new material with all required properties properly set
          child.material = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.7, // Simplified material
            metalness: 0, // No metalness for better performance
            flatShading: false,
            side: THREE.FrontSide,
            transparent: false,
            opacity: 1.0,
            depthTest: true,
            depthWrite: true,
          });
          child.castShadow = false; // Disabled shadows
          child.receiveShadow = false;
          
          // Force material update
          child.material.needsUpdate = true;
        }
      });

      // Add avatar to the shared pivot group (NOT directly to scene)
      pivotGroup.add(object);
      modelRef.current = object;
      sceneRef.current = scene;

      // Store avatar bounding box NOW (pivotGroup.rotation.y = 0 at this point).
      // This gives us stable, rotation-free local-space bounds for clothing alignment.
      object.updateMatrixWorld(true);
      avatarBoundsRef.current = new THREE.Box3().setFromObject(object);
      console.log('Avatar bounds stored:', avatarBoundsRef.current);

      setLoading(false);
    };

    // Load based on file type
    if (isGLB) {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        fullModelUrl,
        (gltf) => {
          processLoadedModel(gltf.scene);
        },
        (xhr) => {
          const percentComplete = (xhr.loaded / xhr.total * 100);
          console.log(percentComplete.toFixed(2) + '% loaded');
        },
        (error) => {
          console.error('Error loading GLB model:', error);
          setError('Failed to load GLB model');
          setLoading(false);
        }
      );
    } else if (isFBX) {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        fullModelUrl,
        processLoadedModel,
        (xhr) => {
          const percentComplete = (xhr.loaded / xhr.total * 100);
          console.log(percentComplete.toFixed(2) + '% loaded');
        },
        (error) => {
          console.error('Error loading FBX model:', error);
          setError('Failed to load FBX model');
          setLoading(false);
        }
      );
    } else if (isOBJ) {
      const objLoader = new OBJLoader();
      objLoader.load(
        fullModelUrl,
        processLoadedModel,
        (xhr) => {
          const percentComplete = (xhr.loaded / xhr.total * 100);
          console.log(percentComplete.toFixed(2) + '% loaded');
        },
        (error) => {
          console.error('Error loading OBJ model:', error);
          setError('Failed to load OBJ model');
          setLoading(false);
        }
      );
    } else {
      setError('Unsupported 3D model format. Please use OBJ, FBX, GLB, or GLTF files.');
      setLoading(false);
    }

    // Load hair model if provided - wait for main model to load first
    if (hairModelUrl) {
      const hairExtension = hairModelUrl.toLowerCase().split('.').pop();
      const hairFullUrl = hairModelUrl.startsWith('http') ? hairModelUrl : `http://localhost:8082${hairModelUrl}`;
      
      console.log('Loading hair model:', hairFullUrl);
      
      // Load hair immediately concurrently with the main model
      if (hairExtension === 'glb' || hairExtension === 'gltf' || hairExtension === 'hair') {
          const gltfLoader = new GLTFLoader();
          gltfLoader.load(
            hairFullUrl,
            (gltf) => {
              const hairModel = gltf.scene;
              
              console.log('Hair model loaded successfully!');
              console.log('Hair model structure:', hairModel);
              
              // Get hair dimensions
              const hairBox = new THREE.Box3().setFromObject(hairModel);
              const hairSize = hairBox.getSize(new THREE.Vector3());
              console.log('Hair original size:', hairSize);
              
              // Scale hair to match mannequin head size (approximately 20cm)
              const hairMaxDim = Math.max(hairSize.x, hairSize.y, hairSize.z);
              const targetHairSize = 0.25; // 25cm for hair
              const hairScale = targetHairSize / hairMaxDim;
              hairModel.scale.set(hairScale, hairScale, hairScale);
              
              // Position hair on top of mannequin's head
              // Mannequin is now rotated -90° on X
              hairModel.position.set(0, 1.0, 0); // Position on top of head
              
              // Rotate hair to match mannequin orientation
              hairModel.rotation.x = -Math.PI / 2; // Match mannequin rotation
              hairModel.rotation.y = 0;
              hairModel.rotation.z = 0; // No Z rotation needed
              
              // Apply realistic hair material
              hairModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  // Dispose of old material if it exists
                  if (child.material) {
                    if (Array.isArray(child.material)) {
                      child.material.forEach(mat => mat.dispose());
                    } else {
                      child.material.dispose();
                    }
                  }
                  
                  // Create new material
                  child.material = new THREE.MeshStandardMaterial({
                    color: 0x654321, // Default brown hair color
                    roughness: 0.6,
                    metalness: 0.0,
                    side: THREE.DoubleSide,
                    transparent: false,
                    opacity: 1.0,
                    depthTest: true,
                    depthWrite: true,
                    flatShading: false,
                  });
                  
                  child.castShadow = true;
                  child.receiveShadow = true;
                  child.material.needsUpdate = true;
                }
              });
              
              // Add hair to the shared pivot group so it rotates with the avatar
              pivotGroup.add(hairModel);
              hairRef.current = hairModel;
              console.log('Hair model added to pivot group at position:', hairModel.position);
              console.log('Hair model rotation:', hairModel.rotation);
              console.log('Hair model scale:', hairModel.scale);
            },
            (progress) => {
              const percent = (progress.loaded / progress.total * 100).toFixed(0);
              console.log(`Hair loading: ${percent}%`);
            },
            (error) => {
              console.error('Error loading hair model:', error);
            }
          );
        }
    }

    // Load clothing model if provided - overlay on mannequin
    if (clothingModelUrl) {
      const clothingExtension = clothingModelUrl.toLowerCase().split('.').pop();
      const clothingFullUrl = clothingModelUrl.startsWith('http') ? clothingModelUrl : `http://localhost:8082${clothingModelUrl}`;
      
      console.log('=== CLOTHING MODEL LOADING ===');
      console.log('Clothing URL:', clothingFullUrl);
      console.log('Clothing extension:', clothingExtension);
      
      // Load clothing immediately concurrently with the main model
      const loadClothingModel = (clothingExtension === 'glb' || clothingExtension === 'gltf') ?
          new GLTFLoader() : 
          (clothingExtension === 'fbx' ? new FBXLoader() : new OBJLoader());
        
        loadClothingModel.load(
          clothingFullUrl,
          (loaded) => {
            const clothingModel = (clothingExtension === 'glb' || clothingExtension === 'gltf') ? 
              loaded.scene : loaded;
            
            console.log('=== CLOTHING MODEL LOADED ===');
            console.log('Clothing model object:', clothingModel);
            console.log('Clothing children count:', clothingModel.children.length);
            
            // ── SNAP rotation to 0 so all bounding-box calculations are in a clean
            //    aligned coordinate space, not a partially-rotated one.
            if (pivotGroupRef.current) pivotGroupRef.current.rotation.y = 0;

            // Detect if clothing is pre-fitted to mannequin coordinate space
            const rawBox = new THREE.Box3().setFromObject(clothingModel);
            const rawSize = rawBox.getSize(new THREE.Vector3());
            const rawMinY = rawBox.min.y;
            const rawMaxY = rawBox.max.y;
            const isPreFitted = (clothingFullUrl || '').toLowerCase().includes('_fitted');

            // ── Use hardcoded avatar dimensions derived from processLoadedModel.
            // processLoadedModel always scales avatar to 3.5 units tall, centered at origin.
            // Feet = -1.75, Head = +1.75, CenterX = 0, CenterZ = 0.
            // Using hardcoded values is MORE reliable than bounding-box at runtime.
            const mHeight  = 3.5;
            const mMinY    = -1.75;
            const mMaxY    = 1.75;
            const mCenterX = 0;
            const mCenterZ = 0;
            // Approximate avatar torso width (avatar is scaled to 3.5 tall, ~0.5 wide shoulder-to-shoulder)
            const mWidth   = avatarBoundsRef.current
              ? (avatarBoundsRef.current.max.x - avatarBoundsRef.current.min.x)
              : 0.9;

            console.log('Avatar sizing constants — mHeight:', mHeight, 'mWidth:', mWidth, 'mMinY:', mMinY);

            if (isPreFitted && modelRef.current) {
              // Pre-fitted model shares 1-to-1 coordinate space with mannequin
              clothingModel.rotation.copy(modelRef.current.rotation);
              clothingModel.scale.copy(modelRef.current.scale);
              clothingModel.position.copy(modelRef.current.position);
              console.log('✅ Applied 1-to-1 Pre-Fitted mesh alignment');
            } else {
              // ── Hardcoded fixes for specific test files that are exported backwards or miscategorized ──
              const urlLower = (clothingFullUrl || '').toLowerCase();
              
              // We can no longer guess Z-up based on bounding boxes because it flips standard Y-up web models upside down!
              // Instead, we only rotate the specific models you exported from Blender as Z-up.
              let isZUp = false;
              let yRotation = 0;
              let effectiveCat = (productCategory || '').toLowerCase();

              let xRotation = 0;

              if (urlLower.includes('suit.obj') || urlLower.includes('pant.obj') || 
                  urlLower.includes('real_suit.glb') || urlLower.includes('real_pants.glb')) {
                xRotation = -Math.PI / 2; // These models were exported lying on their backs
              } else if (urlLower.includes('shirt.obj') || urlLower.includes('real_shirt.glb')) {
                xRotation = Math.PI / 2;  // The shirt was exported lying on its face (or flipped), so -90 makes it upside down, it needs +90!
              }

              if (urlLower.includes('suit.obj') || urlLower.includes('real_suit.glb')) {
                effectiveCat = 'suit'; // Override 'Pants' from the database so it anchors to shoulders
                yRotation = Math.PI;   // Rotate 180 degrees because the suit was modeled facing backwards
              } else if (urlLower.includes('shirt.obj') || urlLower.includes('real_shirt.glb')) {
                effectiveCat = 'shirt'; 
                yRotation = -Math.PI / 2; // The shirt was actually modeled facing sideways (like the dress), spin it 90 degrees!
              } else if (urlLower.includes('model-cmnoivjrn09p0u3mht6w5esfm.obj') || urlLower.includes('real_dress.glb')) {
                effectiveCat = 'dress'; // The "Hoodie" is actually a dress model
                yRotation = 0; // The dress was likely modeled facing forward, do not spin it 90 degrees!
              } else if (urlLower.includes('new_shirt.glb')) {
                effectiveCat = 'shirt';
                yRotation = Math.PI; // Spin 180 degrees to face the front
              }
              
              // Apply explicit rotations to fix export orientations
              clothingModel.rotation.x = xRotation;
              clothingModel.rotation.z = 0;
              clothingModel.rotation.y = yRotation;
              clothingModel.updateMatrixWorld(true);

              // Default target dimensions based on category
              let targetMaxDim = 2.0;
              let targetTopRatio = 0.8;
              let zOffset = 0;
              let zStretch = 1.0;

              if (effectiveCat.includes('dress') || effectiveCat.includes('frock') || effectiveCat.includes('gown')) {
                if (urlLower.includes('new_frock.glb')) {
                  targetMaxDim = 1.1;     // Shrink procedural frock
                } else {
                  targetMaxDim = 1.85;    // Scaled down to prevent oversized straps/bulk
                }
                targetTopRatio = 0.86;  // Raised to perfectly sit on the shoulders
                zOffset = 0;            // Centered perfectly
                zStretch = 1.2;         // Slight depth boost to cover the back
              } else if (effectiveCat.includes('pant') || effectiveCat.includes('trouser') || effectiveCat.includes('jean') || effectiveCat.includes('skirt')) {
                if (urlLower.includes('new_skirt.glb')) {
                  targetMaxDim = 0.8;     // The procedural skirt is very wide, shrink it
                } else {
                  targetMaxDim = 1.9;     // Pants are long
                }
                targetTopRatio = 0.52;  // Waist level
                zOffset = 0;
              } else if (effectiveCat.includes('shirt') || effectiveCat.includes('top') || effectiveCat.includes('jacket') || effectiveCat.includes('coat') || effectiveCat.includes('suit') || effectiveCat.includes('hoodie') || effectiveCat.includes('blazer')) {
                // The new generic T-shirt is extremely wide, so setting its max dimension to 1.8 made it huge.
                if (urlLower.includes('new_shirt.glb')) {
                  targetMaxDim = 1.05;    // Slightly larger to prevent side clipping
                  targetTopRatio = 0.76;  // Lower to reveal the neck and head clearly
                  zStretch = 1.3;         // Thicken the flat T-shirt on the Z-axis to cover the avatar's chest/back
                } else {
                  targetMaxDim = 1.8;     // Keep larger for the bulky red suit
                  targetTopRatio = 0.81;  // Shoulders
                }
                zOffset = 0;
              }

              // Get rotated clothing dimensions
              const rotatedBox2 = new THREE.Box3().setFromObject(clothingModel);
              const rotatedSize2 = rotatedBox2.getSize(new THREE.Vector3());
              const maxDim = Math.max(rotatedSize2.x, rotatedSize2.y, rotatedSize2.z, 0.001);

              // Apply strict uniform scaling based on the largest dimension of the model
              // This guarantees the model NEVER becomes a squished pancake or distorted noodle.
              const uniformScale = targetMaxDim / maxDim;
              
              clothingModel.scale.set(
                uniformScale, 
                uniformScale, 
                uniformScale * zStretch // Only dresses get a slight depth boost to prevent back clipping
              );
              clothingModel.updateMatrixWorld(true);

              // Compute final positioned bounds
              const finalBox = new THREE.Box3().setFromObject(clothingModel);
              const finalCenterX = (finalBox.min.x + finalBox.max.x) / 2;
              const finalCenterZ = (finalBox.min.z + finalBox.max.z) / 2;
              const finalTopY = finalBox.max.y;

              // Anchor the top of the bounding box to the avatar's targeted body part
              const targetTopY = mMinY + (targetTopRatio * mHeight);

              clothingModel.position.set(
                mCenterX - finalCenterX,
                targetTopY - finalTopY,
                mCenterZ - finalCenterZ + zOffset
              );
              console.log('✅ Auto-fitted clothing — scale:', uniformScale, ' position:', clothingModel.position);
            }
            
            // Apply clothing material with product color & polygonOffset to eliminate clipping
            let meshCount = 0;
            clothingModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                meshCount++;
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
                
                // Use productColorRef.current so we always get the LATEST selected colour,
                // not the stale value captured when the main useEffect first ran.
                const clothingColorMap = {
                  'white': 0xFFFFFF, 'black': 0x000000, 'red': 0xDC143C, 'blue': 0x4169E1,
                  'navy': 0x000080, 'green': 0x228B22, 'yellow': 0xFFD700, 'pink': 0xFF69B4,
                  'purple': 0x9370DB, 'orange': 0xFF8C00, 'gray': 0x808080, 'grey': 0x808080,
                  'brown': 0x8B4513, 'beige': 0xF5F5DC, 'cream': 0xFFFDD0, 'maroon': 0x800000,
                  'cyan': 0x00CED1, 'teal': 0x008080, 'olive': 0x808000, 'gold': 0xFFD700,
                  'silver': 0xC0C0C0, 'lavender': 0xE6E6FA, 'peach': 0xFFDAB9,
                };
                const currentColor = (productColorRef.current || 'white').toLowerCase().trim();
                const resolvedColor = clothingColorMap[currentColor] 
                  || (currentColor.startsWith('#') ? parseInt(currentColor.replace('#',''), 16) : null)
                  || 0xDC143C; // default to red if unknown
                child.material = new THREE.MeshStandardMaterial({
                  color: resolvedColor,
                  roughness: 0.6,
                  metalness: 0.0,
                  side: THREE.DoubleSide,
                  transparent: false,
                  opacity: 1.0,
                  depthTest: true,
                  depthWrite: true,
                  polygonOffset: true,
                  polygonOffsetFactor: -1,
                  polygonOffsetUnits: -1,
                  flatShading: false,
                });
                
                child.castShadow = true;
                child.receiveShadow = true;
                child.renderOrder = 1;
                child.material.needsUpdate = true;
              }
            });
            
            console.log('Total meshes in clothing:', meshCount);
            
            // Make mannequin slightly transparent so clothing is more visible
            if (modelRef.current) {
              let mannequinMeshCount = 0;
              modelRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  mannequinMeshCount++;
                  child.material.transparent = true;
                  child.material.opacity = 0.9; // Keep mannequin mostly visible
                  child.renderOrder = 0;
                }
              });
              console.log('Made mannequin semi-transparent, meshes:', mannequinMeshCount);
            }
            
            // Add clothing to the SAME pivot group as the avatar.
            // This locks clothing orientation permanently to the avatar's front face.
            if (pivotGroupRef.current) {
              pivotGroupRef.current.add(clothingModel);
            } else {
              scene.add(clothingModel); // fallback
            }
            clothingRef.current = clothingModel;
            console.log('=== CLOTHING MODEL ADDED TO PIVOT GROUP ===');
            console.log('Pivot group children count:', pivotGroupRef.current?.children.length);
          },
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Clothing loading: ${percent}%`);
          },
          (error) => {
            console.error('=== ERROR LOADING CLOTHING ===');
            console.error('Error:', error);
          }
        );
    } else {
      console.log('No clothing model URL provided');
    }

    // Animation loop with delta time for super smooth, frame-rate independent rotation
    let lastTime = performance.now();
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1); // Cap delta to prevent huge jumps
      lastTime = now;
      
      if (isAutoRotatingRef.current) {
        const rotateSpeed = 2.0; // 2.0 radians/sec = fast and smooth
        // Rotate the PIVOT GROUP — avatar + clothing + hair all rotate as one locked unit.
        // This guarantees clothing front always faces the same direction as avatar front.
        if (pivotGroupRef.current) {
          pivotGroupRef.current.rotation.y += rotateSpeed * delta;
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const containerWidth = typeof width === 'number' ? width : mountRef.current?.offsetWidth || 400;
      const containerHeight = typeof height === 'number' ? height : 600;
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerWidth, containerHeight);
      setContainerSize({ width: containerWidth, height: containerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [modelUrl, hairModelUrl, clothingModelUrl, width, height]);

  // Keep productColorRef in sync with the latest prop so the clothing load
  // callback (inside a setTimeout) always reads the current value.
  useEffect(() => {
    productColorRef.current = productColor;
  }, [productColor]);

  // Check if this is an avatar/mannequin
  const isAvatarModel = (productCategory || '').toLowerCase().includes('avatar') || 
                        (productCategory || '').toLowerCase().includes('mannequin');

  // Separate effect to handle productColor changes without reloading the model
  useEffect(() => {
    if (!productColor) return;

    // Full colour map
    const colorMap = {
      'White': 0xFFFFFF, 'Black': 0x000000, 'Red': 0xDC143C, 'Blue': 0x4169E1,
      'Navy': 0x000080, 'Green': 0x228B22, 'Yellow': 0xFFD700, 'Pink': 0xFF69B4,
      'Purple': 0x9370DB, 'Orange': 0xFF8C00, 'Gray': 0x808080, 'Grey': 0x808080,
      'Brown': 0x8B4513, 'Beige': 0xF5F5DC, 'Cream': 0xFFFDD0, 'Maroon': 0x800000,
      'Cyan': 0x00CED1, 'Teal': 0x008080, 'Olive': 0x808000, 'Gold': 0xFFD700,
      'Silver': 0xC0C0C0, 'Lavender': 0xE6E6FA, 'Peach': 0xFFDAB9,
    };

    let colorHex;
    if (typeof productColor === 'string') {
      // Case-insensitive lookup
      const key = Object.keys(colorMap).find(k => k.toLowerCase() === productColor.toLowerCase().trim());
      colorHex = key ? colorMap[key] : (productColor.startsWith('#') ? parseInt(productColor.replace('#',''), 16) : 0xCCCCCC);
    } else {
      colorHex = productColor || 0xCCCCCC;
    }

    console.log('Applying color:', productColor, '-> hex:', colorHex.toString(16));

    const applyColor = () => {
      if (clothingRef.current) {
        // Clothing is loaded — update it directly
        changeClothingColor(colorHex);
      } else if (modelRef.current && !loading && !applyAvatarCustomization && !isAvatarModel) {
        // No clothing yet (still in 2-second setTimeout). Retry after clothing delay.
        // We schedule a retry at 2.5 s to be safe (only for standalone non-avatar models).
        const retryId = setTimeout(() => {
          changeColor(colorHex);
        }, 2500);
        return () => clearTimeout(retryId);
      }
    };

    applyColor();
  }, [productColor]);

  // Apply avatar customizations (skin tone, hair color, eye color) after model loads
  useEffect(() => {
    if (!applyAvatarCustomization || !modelRef.current || loading) {
      return;
    }

    console.log('Applying avatar customizations:', {
      skinTone: initialSkinTone,
      hairColor: initialHairColor,
      eyeColor: initialEyeColor
    });

    // Map skin tones to hex colors
    const skinToneMap = {
      'light': 0xFFE0BD,
      'medium': 0xD4A574,
      'tan': 0xC68642,
      'dark': 0x8D5524
    };

    // Map hair colors to hex
    const hairColorMap = {
      'black': 0x000000,
      'brown': 0x654321,
      'blonde': 0xFAF0BE,
      'red': 0x8B0000,
      'gray': 0x808080,
      'grey': 0x808080
    };

    // Apply skin tone to avatar body
    if (initialSkinTone && skinToneMap[initialSkinTone.toLowerCase()]) {
      console.log('Applying skin tone:', initialSkinTone);
      changeSkinTone(skinToneMap[initialSkinTone.toLowerCase()]);
    }

    // Apply hair color if hair model exists
    if (initialHairColor && hairColorMap[initialHairColor.toLowerCase()] && hairRef.current) {
      console.log('Applying hair color:', initialHairColor);
      changeHairColor(hairColorMap[initialHairColor.toLowerCase()]);
    }

    // Eye color would need specific mesh targeting - implement if needed
    if (initialEyeColor) {
      console.log('Eye color customization not yet implemented:', initialEyeColor);
    }
  }, [applyAvatarCustomization, initialSkinTone, initialHairColor, initialEyeColor, loading]);

  // Change avatar body skin tone
  const changeSkinTone = (colorHex) => {
    if (modelRef.current) {
      console.log('Changing skin tone to:', colorHex);
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat && mat.color) {
                mat.color.set(colorHex);
                mat.needsUpdate = true;
              }
            });
          } else {
            if (child.material.color) {
              child.material.color.set(colorHex);
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  };

  // Change clothing color separately
  const changeClothingColor = (colorHex) => {
    if (clothingRef.current) {
      console.log('Changing clothing color to:', colorHex);
      clothingRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat && mat.color) {
                mat.color.set(colorHex);
                mat.needsUpdate = true;
              }
            });
          } else {
            if (child.material.color) {
              child.material.color.set(colorHex);
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  };

  // Change model color - with safety checks (does not touch avatar skin if applyAvatarCustomization or isAvatar is true)
  const changeColor = (colorHex) => {
    console.log('changeColor called with:', colorHex);
    
    if (!sceneRef.current) {
      console.warn('Scene not ready');
      return;
    }
    
    // Change clothing color if present
    if (clothingRef.current) {
      changeClothingColor(colorHex);
    }
    // Otherwise change mannequin/model color ONLY if not an avatar with customization
    else if (modelRef.current && !applyAvatarCustomization && !isAvatarModel) {
      changeSkinTone(colorHex);
    } else {
      console.log('Preserving saved avatar skin tone - skipped recoloring mannequin body with product color');
    }
  };

  // Change hair color separately
  const changeHairColor = (colorHex) => {
    if (hairRef.current) {
      hairRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material && child.material.color) {
          child.material.color.set(colorHex);
          child.material.needsUpdate = true;
        }
      });
    }
  };

  // Expose methods to parent via ref - make sure changeColor and changeSkinTone are always available
  useImperativeHandle(ref, () => ({
    changeColor: (colorHex) => {
      changeColor(colorHex);
    },
    changeSkinTone: (colorHex) => {
      changeSkinTone(colorHex);
    },
    changeClothingColor: (colorHex) => {
      changeClothingColor(colorHex);
    },
    changeHairColor: (colorHex) => {
      changeHairColor(colorHex);
    }
  }));

  // Handle color selection
  const handleColorChange = (color) => {
    setSelectedColor(color.name);
    changeColor(color.hex);
  };

  // Toggle auto-rotation
  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      isAutoRotatingRef.current = !isAutoRotating; // Update ref so animate loop sees the change immediately
      setIsAutoRotating(!isAutoRotating);
    }
  };

  // Reset camera position
  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Jump to specific view angles
  const jumpToView = (angle) => {
    if (controlsRef.current) {
      const radius = 7; // Distance from model - matches camera position
      const height = 0; // Camera height - centered
      
      // Calculate camera position based on angle
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      
      // Smoothly move camera to new position
      controlsRef.current.object.position.set(x, height, z);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: typeof height === 'number' ? height : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: typeof height === 'number' ? height : '100%' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            zIndex: 1,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading 3D Model...
          </Typography>
        </Box>
      )}
      
      {/* Control buttons */}
      {!loading && (
        <>
          {/* View angle buttons */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 2,
            }}
          >
            <Tooltip title="Front View" placement="left">
              <IconButton 
                onClick={() => jumpToView(0)} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
              >
                <Typography variant="caption" fontWeight="bold">F</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Right Side" placement="left">
              <IconButton 
                onClick={() => jumpToView(Math.PI / 2)} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
              >
                <Typography variant="caption" fontWeight="bold">R</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Back View" placement="left">
              <IconButton 
                onClick={() => jumpToView(Math.PI)} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
              >
                <Typography variant="caption" fontWeight="bold">B</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Left Side" placement="left">
              <IconButton 
                onClick={() => jumpToView(-Math.PI / 2)} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
              >
                <Typography variant="caption" fontWeight="bold">L</Typography>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Bottom controls container */}
          {showControls && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: showColorPicker ? 'space-between' : 'flex-end',
              alignItems: 'flex-end',
              zIndex: 2,
            }}
          >
            {/* Color picker - only show if showColorPicker is true */}
            {showColorPicker && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  padding: 1.5,
                  boxShadow: 2,
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  Colors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: 180 }}>
                  {availableColors.map((color) => (
                    <Tooltip key={color.name} title={color.name}>
                      <Box
                        onClick={() => handleColorChange(color)}
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: color.hex,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: selectedColor === color.name ? '3px solid #1976d2' : '2px solid #ddd',
                          boxShadow: selectedColor === color.name ? 2 : 0,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.15)',
                            boxShadow: 2,
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}

            {/* Playback controls */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                bgcolor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                padding: 1,
                boxShadow: 2,
              }}
            >
              <Tooltip title={isAutoRotating ? "Pause Rotation" : "Auto Rotate"}>
                <IconButton onClick={toggleAutoRotate} size="small" color="primary">
                  {isAutoRotating ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset View">
                <IconButton onClick={resetCamera} size="small" color="primary">
                  <ThreeSixty />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          )}
        </>
      )}

      {/* Instructions */}
      {!loading && showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            zIndex: 2,
          }}
        >
          <Typography variant="caption" display="block">
            🖱️ Drag to rotate
          </Typography>
          <Typography variant="caption" display="block">
            🔍 Scroll to zoom
          </Typography>
        </Box>
      )}
      
      <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
    </Box>
  );
});

export default Model3DViewer;
