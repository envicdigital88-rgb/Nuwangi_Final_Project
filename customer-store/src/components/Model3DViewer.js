import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { PlayArrow, Pause, ThreeSixty } from '@mui/icons-material';

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isAutoRotating, setIsAutoRotating] = React.useState(autoRotate);
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
    
    controls.autoRotate = autoRotate; // Use prop value
    controls.autoRotateSpeed = 2.0; // Smooth rotation speed
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
      
      // Apply rotation based on product category
      const category = (productCategory || 'shirt').toLowerCase();
      console.log('Category after toLowerCase:', category);
      
      if (category.includes('avatar') || category.includes('mannequin')) {
        // AVATAR/MANNEQUIN: Stand upright (Y axis is natively 180cm vertical height)
        object.rotation.x = 0;
        object.rotation.y = 0;
        object.rotation.z = 0;
        console.log('✅ Applied AVATAR upright rotation (X: 0°)');
      } else if (category.includes('dress') || category.includes('frock')) {
        // DRESSES: Stand upright and face forward
        object.rotation.x = 0;
        object.rotation.y = Math.PI; // Rotate 180° to face front
        object.rotation.z = 0;
        console.log('✅ Applied DRESS rotation (Y:180° to face front)');
      } else if (category.includes('pant') || category.includes('trouser') || category.includes('jean')) {
        // PANTS: Stand upright and face forward
        object.rotation.x = 0;
        object.rotation.y = Math.PI; // Rotate 180° to face front
        object.rotation.z = 0;
        console.log('Applied PANTS rotation (upright, facing front)');
      } else {
        // SHIRTS, TOPS, JACKETS and others: Stand upright and face forward
        object.rotation.x = 0;
        object.rotation.y = Math.PI; // Rotate 180° to face front
        object.rotation.z = 0;
        console.log('✅ Applied SHIRT/TOP rotation (upright, facing front)');
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

      scene.add(object);
      modelRef.current = object;
      sceneRef.current = scene;
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
      
      // Wait a bit for main model to load, then add hair
      setTimeout(() => {
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
              
              scene.add(hairModel);
              hairRef.current = hairModel;
              console.log('Hair model added to scene at position:', hairModel.position);
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
      }, 1500); // Wait 1.5 seconds for main model to load
    }

    // Load clothing model if provided - overlay on mannequin
    if (clothingModelUrl) {
      const clothingExtension = clothingModelUrl.toLowerCase().split('.').pop();
      const clothingFullUrl = clothingModelUrl.startsWith('http') ? clothingModelUrl : `http://localhost:8082${clothingModelUrl}`;
      
      console.log('=== CLOTHING MODEL LOADING ===');
      console.log('Clothing URL:', clothingFullUrl);
      console.log('Clothing extension:', clothingExtension);
      
      // Wait for mannequin to load, then add clothing
      setTimeout(() => {
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
            
            // Apply same rotation as mannequin to match orientation
            // Mannequin is now upright facing front (Y: 180°)
            clothingModel.rotation.x = 0;
            clothingModel.rotation.y = Math.PI; // Match mannequin facing front
            clothingModel.rotation.z = 0;
            console.log('Applied clothing rotation matching mannequin (upright, Y: 180°)');
            
            // Update matrix after rotation
            clothingModel.updateMatrixWorld(true);
            
            // Get clothing dimensions AFTER rotation
            const clothingBox = new THREE.Box3().setFromObject(clothingModel);
            const clothingSize = clothingBox.getSize(new THREE.Vector3());
            
            console.log('Clothing size after rotation:', clothingSize);
            
            // === PERFECT FIT: Align clothing to mannequin using world bounding box ===
            // Get the mannequin's actual world bounding box for reference
            let mannequinWorldBox = null;
            let mannequinHeight = 2.5;
            let mannequinBottom = -1.25;
            let mannequinCenterX = 0;
            let mannequinCenterZ = 0;
            
            if (modelRef.current) {
              mannequinWorldBox = new THREE.Box3().setFromObject(modelRef.current);
              mannequinHeight = mannequinWorldBox.max.y - mannequinWorldBox.min.y;
              mannequinBottom = mannequinWorldBox.min.y;
              mannequinCenterX = (mannequinWorldBox.min.x + mannequinWorldBox.max.x) / 2;
              mannequinCenterZ = (mannequinWorldBox.min.z + mannequinWorldBox.max.z) / 2;
              console.log('Mannequin world box:', mannequinWorldBox);
              console.log('Mannequin height:', mannequinHeight, 'bottom:', mannequinBottom);
            }
            
            // Scale clothing so its HEIGHT exactly matches the mannequin's height
            // This gives the most accurate anatomical fit
            const clothingScale = mannequinHeight / clothingSize.y;
            clothingModel.scale.multiplyScalar(clothingScale);
            console.log('Clothing scale (height-matched):', clothingScale);
            
            // Recalculate bounding box after scaling
            clothingModel.updateMatrixWorld(true);
            const scaledClothingBox = new THREE.Box3().setFromObject(clothingModel);
            const scaledClothingCenterX = (scaledClothingBox.min.x + scaledClothingBox.max.x) / 2;
            const scaledClothingCenterZ = (scaledClothingBox.min.z + scaledClothingBox.max.z) / 2;
            
            // Align clothing bottom with mannequin bottom (feet-to-feet alignment)
            // and center X/Z with mannequin center
            clothingModel.position.set(
              mannequinCenterX - scaledClothingCenterX,
              mannequinBottom - scaledClothingBox.min.y,
              mannequinCenterZ - scaledClothingCenterZ
            );
            
            console.log('Clothing final position (bottom-aligned):', clothingModel.position);
            
            // Apply clothing material with product color
            let meshCount = 0;
            clothingModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                meshCount++;
                
                // Dispose of old material if it exists
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
                
                // Create new material if it doesn't exist
                child.material = new THREE.MeshStandardMaterial({
                  color: productColor === 'White' ? 0xffffff : 
                         productColor === 'Black' ? 0x000000 :
                         productColor === 'Red' ? 0xDC143C :
                         productColor === 'Blue' ? 0x4169E1 :
                         0xcccccc,
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
                child.renderOrder = 1;
                child.material.needsUpdate = true;
                
                console.log('Applied material to mesh:', child.name || 'unnamed');
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
            
            scene.add(clothingModel);
            clothingRef.current = clothingModel;
            console.log('=== CLOTHING MODEL ADDED TO SCENE ===');
            console.log('Scene children count:', scene.children.length);
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
      }, 2000); // Wait 2 seconds for mannequin to load
    } else {
      console.log('No clothing model URL provided');
    }

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
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

  // Separate effect to handle productColor changes without reloading the model
  useEffect(() => {
    // Wait for model to be loaded
    if (!productColor || !modelRef.current || loading) {
      console.log('Skipping color change - model not ready:', { 
        hasProductColor: !!productColor, 
        hasModel: !!modelRef.current, 
        loading 
      });
      return;
    }
    
    console.log('Product color changed to:', productColor);
    
    // Map color names to hex values
    const colorMap = {
      'White': 0xFFFFFF,
      'Black': 0x000000,
      'Red': 0xDC143C,
      'Blue': 0x4169E1,
      'Navy': 0x000080,
      'Green': 0x228B22,
      'Yellow': 0xFFD700,
      'Pink': 0xFF69B4,
      'Purple': 0x9370DB,
      'Orange': 0xFF8C00,
      'Gray': 0x808080,
      'Grey': 0x808080,
      'Brown': 0x8B4513,
      'Beige': 0xF5F5DC,
      'Cream': 0xFFFDD0,
    };
    
    // Convert color name to hex
    let colorHex;
    if (typeof productColor === 'string') {
      colorHex = colorMap[productColor] || parseInt(productColor.replace('#', '0x'), 16) || 0xCCCCCC;
    } else {
      colorHex = productColor || 0xCCCCCC;
    }
    
    console.log('Applying color:', productColor, '-> hex:', colorHex);
    
    // Apply color to the model
    changeColor(colorHex);
  }, [productColor, loading]);

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
      changeColor(skinToneMap[initialSkinTone.toLowerCase()]);
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

  // Change model color - with safety checks
  const changeColor = (colorHex) => {
    console.log('changeColor called with:', colorHex);
    
    if (!sceneRef.current) {
      console.warn('Scene not ready');
      return;
    }
    
    // Change clothing color if present
    if (clothingRef.current) {
      console.log('Changing clothing color');
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
    // Otherwise change mannequin/model color
    else if (modelRef.current) {
      console.log('Changing model color');
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

  // Expose methods to parent via ref - make sure changeColor is always available
  useImperativeHandle(ref, () => ({
    changeColor: (colorHex) => {
      changeColor(colorHex);
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
      controlsRef.current.autoRotate = !isAutoRotating;
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
