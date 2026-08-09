package com.virtualtryonsaas.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/models")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class ModelFileController {

    private static final String MODELS_DIR = "src/main/resources/static/uploads/models/";

    @GetMapping("/hair")
    public ResponseEntity<Resource> getHairModel() {
        try {
            Path filePath = Paths.get(MODELS_DIR + "HairPackPT1.glb");
            File file = filePath.toFile();
            
            if (!file.exists()) {
                System.out.println("Hair model file not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            System.out.println("Serving hair model: " + file.getAbsolutePath() + " (" + file.length() + " bytes)");
            
            Resource resource = new FileSystemResource(file);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("model/gltf-binary"));
            headers.setContentLength(file.length());
            headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
            headers.set(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000");
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"HairPackPT1.glb\"");
            
            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error serving hair model: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/mannequin")
    public ResponseEntity<Resource> getMannequinModel() {
        try {
            Path filePath = Paths.get(MODELS_DIR + "ScaleReferenceDummy.obj");
            File file = filePath.toFile();
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("model/obj"));
            headers.setContentLength(file.length());
            headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
            headers.set(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000");
            
            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
