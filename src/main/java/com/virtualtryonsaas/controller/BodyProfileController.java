package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.BodyProfileDto;
import com.virtualtryonsaas.service.BodyProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/body-profile")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class BodyProfileController {

    @Autowired
    private BodyProfileService bodyProfileService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<BodyProfileDto> getUserBodyProfile(@PathVariable UUID userId) {
        BodyProfileDto profile = bodyProfileService.getUserBodyProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/create")
    public ResponseEntity<BodyProfileDto> createBodyProfile(@Valid @RequestBody BodyProfileDto profileDto) {
        BodyProfileDto created = bodyProfileService.createBodyProfile(profileDto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodyProfileDto> updateBodyProfile(@PathVariable UUID id, 
                                                           @Valid @RequestBody BodyProfileDto profileDto) {
        BodyProfileDto updated = bodyProfileService.updateBodyProfile(id, profileDto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/analyze-photo")
    public ResponseEntity<BodyProfileDto> analyzePhotoAndCreateProfile(@RequestParam("photo") MultipartFile photo,
                                                                      @RequestParam("userId") UUID userId) {
        BodyProfileDto profile = bodyProfileService.analyzePhotoAndCreateProfile(photo, userId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/upload-avatar-photo")
    public ResponseEntity<String> uploadAvatarPhoto(@RequestParam("photo") MultipartFile photo,
                                                   @RequestParam("userId") UUID userId) {
        String imageUrl = bodyProfileService.uploadAvatarPhoto(photo, userId);
        return ResponseEntity.ok(imageUrl);
    }
}