package com.virtualtryonsaas.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/model")
    public ResponseEntity<?> uploadModel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file"));
            }

            // Get file extension
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            
            // Generate unique filename
            String filename = UUID.randomUUID().toString() + extension;
            
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR + "models");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL
            String fileUrl = "/uploads/models/" + filename;
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file"));
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            Path uploadPath = Paths.get(UPLOAD_DIR + "images");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "/uploads/images/" + filename;
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/models/list")
    public ResponseEntity<?> listAvailableModels() {
        try {
            Path rootModelsPath = Paths.get(UPLOAD_DIR + "models");
            Path staticModelsPath = Paths.get("src/main/resources/static/uploads/models");
            
            java.util.List<Map<String, String>> models = new java.util.ArrayList<>();
            
            java.util.List<Path> pathsToScan = java.util.Arrays.asList(rootModelsPath, staticModelsPath);
            
            for (Path modelsPath : pathsToScan) {
                if (Files.exists(modelsPath)) {
                    Files.walk(modelsPath)
                        .filter(Files::isRegularFile)
                        .filter(path -> {
                            String filename = path.getFileName().toString().toLowerCase();
                            return filename.endsWith(".obj") || filename.endsWith(".glb") || 
                                   filename.endsWith(".gltf") || filename.endsWith(".fbx");
                        })
                        .forEach(path -> {
                            try {
                                String relativePath = modelsPath.relativize(path).toString().replace("\\", "/");
                                String url = "/uploads/models/" + relativePath;
                                String filename = path.getFileName().toString();
                                
                                // Avoid duplicates if the same file exists in both places
                                boolean alreadyExists = models.stream().anyMatch(m -> m.get("filename").equals(filename));
                                if (!alreadyExists) {
                                    Map<String, String> model = new HashMap<>();
                                    model.put("filename", filename);
                                    model.put("url", url);
                                    model.put("name", filename.substring(0, filename.lastIndexOf(".")));
                                    models.add(model);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        });
                }
            }
            
            return ResponseEntity.ok(Map.of("models", models));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to list models: " + e.getMessage()));
        }
    }

    @GetMapping("/serve-model")
    public ResponseEntity<Resource> serveModel(@RequestParam("path") String modelPath) {
        try {
            System.out.println("Serving model: " + modelPath);
            
            // Clean the path - remove leading /uploads/ if present
            String cleanPath = modelPath.startsWith("/uploads/") 
                ? modelPath.substring(9) 
                : modelPath;
            
            System.out.println("Clean path: " + cleanPath);
            
            Resource resource = new ClassPathResource("static/uploads/" + cleanPath);
            
            // Fallback: look in root-level uploads/ directory
            if (!resource.exists() || !resource.isReadable()) {
                java.io.File fsFile = Paths.get("uploads/" + cleanPath).toFile();
                if (fsFile.exists()) {
                    resource = new FileSystemResource(fsFile);
                    System.out.println("Found in root uploads/ dir: " + fsFile.getAbsolutePath());
                }
            }
            
            System.out.println("Resource exists: " + resource.exists());
            System.out.println("Resource readable: " + resource.isReadable());
            
            if (!resource.exists() || !resource.isReadable()) {
                System.out.println("Resource not found or not readable");
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = "application/octet-stream";
            String filename = resource.getFilename();
            if (filename != null) {
                if (filename.endsWith(".obj")) {
                    contentType = "model/obj";
                } else if (filename.endsWith(".fbx")) {
                    contentType = "application/octet-stream";
                } else if (filename.endsWith(".gltf")) {
                    contentType = "model/gltf+json";
                } else if (filename.endsWith(".glb")) {
                    contentType = "model/gltf-binary";
                }
            }

            System.out.println("Serving file: " + filename + " with content type: " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);

        } catch (Exception e) {
            System.out.println("Error serving model: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
