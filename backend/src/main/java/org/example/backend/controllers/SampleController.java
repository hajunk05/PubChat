package org.example.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
public class SampleController {

  List<String> db = new ArrayList<>();

  @GetMapping("/something")
  public ResponseEntity<String> sampleController() {

    return ResponseEntity.ok("Hello");
  }

  @PostMapping("/post")
  public ResponseEntity<String> createStringData(@RequestBody String str) {
    db.add(str);
    System.out.println(db);
    return ResponseEntity.ok(str);
  }

}
