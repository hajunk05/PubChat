package org.example.backend.controllers;

import org.example.backend.models.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class UserController {

  @Autowired
  private UserRepository userRepository;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @PostMapping("/api/signup")
  public ResponseEntity createUser(@RequestBody User user) {
    if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
      return ResponseEntity.badRequest().body("Email is required");
    }

    if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
      return ResponseEntity.badRequest().body("Password is required");
    }

    if (userRepository.findFirstByEmail(user.getEmail()) != null) {
      return ResponseEntity.badRequest().body("An account with this email already exists");
    }

    if (userRepository.findFirstByUsername(user.getUsername()) != null) {
      return ResponseEntity.badRequest().body("Username already taken");
    }

    String hashedPassword = passwordEncoder.encode(user.getPassword());
    user.setPassword(hashedPassword);

    User savedUser = userRepository.save(user);
    return ResponseEntity.ok(savedUser);
  }


  // axios.post('/api/login?email={}&password={}')
  @PostMapping("/api/login")
  public ResponseEntity login(@RequestParam String username, @RequestParam String password) {
    User savedUser = userRepository.findFirstByUsername(username);
    if (savedUser == null) {
      return ResponseEntity.badRequest().body("User does not exist");
    }

    if (!passwordEncoder.matches(password, savedUser.getPassword())) {
      return ResponseEntity.badRequest().body("Incorrect Password/Username");
    }
    return ResponseEntity.ok(savedUser);
  }

  @GetMapping("/api/users/profile-pictures")
  public ResponseEntity<Map<String, String>> getProfilePictures(@RequestParam List<String> usernames) {
    Map<String, String> profilePictures = new HashMap<>();
    for (String username : usernames) {
      User user = userRepository.findFirstByUsername(username);
      if (user != null) {
        profilePictures.put(username, user.getProfilePicture());
      }
    }
    return ResponseEntity.ok(profilePictures);
  }

  @PutMapping("/api/users/{id}")
  public ResponseEntity updateUser(@PathVariable String id, @RequestBody Map<String, String> updates) {
    User user = userRepository.findById(id).orElse(null);
    if (user == null) {
      return ResponseEntity.badRequest().body("User not found");
    }

    if (updates.containsKey("username")) {
      String newUsername = updates.get("username");
      User existingUser = userRepository.findFirstByUsername(newUsername);
      if (existingUser != null && !existingUser.getId().equals(id)) {
        return ResponseEntity.badRequest().body("Username already taken");
      }
      user.setUsername(newUsername);
    }

    if (updates.containsKey("profilePicture")) {
      user.setProfilePicture(updates.get("profilePicture"));
    }

    User savedUser = userRepository.save(user);
    return ResponseEntity.ok(savedUser);
  }

}
