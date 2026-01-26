package org.example.backend.controllers;

import org.example.backend.models.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
public class UserController {

  @Autowired
  private UserRepository userRepository;

  @PostMapping("/api/signup")
  public ResponseEntity<User> createUser(@RequestBody User user) {
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
    if (!savedUser.getPassword().equals(password)) {
      return ResponseEntity.badRequest().body("Incorrect Password/Username");
    }
    return ResponseEntity.ok(savedUser);
  }



}
