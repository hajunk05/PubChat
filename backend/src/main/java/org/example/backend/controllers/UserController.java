package org.example.backend.controllers;

import org.example.backend.models.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
public class UserController {

  @Autowired
  private UserRepository userRepository;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @PostMapping("/api/signup")
  public ResponseEntity createUser(@RequestBody User user) {
    if (userRepository.findFirstByUsername(user.getUsername()) != null) {
      return ResponseEntity.badRequest().body("User Already Exists");
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



}
