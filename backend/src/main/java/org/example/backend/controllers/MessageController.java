package org.example.backend.controllers;

import org.example.backend.models.Message;
import org.example.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class MessageController {

  @Autowired
  private MessageRepository messageRepository;

  @PostMapping("/messages")
  public ResponseEntity<Message> createMessage(@RequestBody Message message) {
    Message savedMessage = messageRepository.save(message);
    return ResponseEntity.ok(savedMessage);
  }

  @GetMapping("/messages")
  public ResponseEntity<List<Message>> getAllMessages() {
    return ResponseEntity.ok(messageRepository.findAll());
  }

}
