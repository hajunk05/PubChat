package org.example.backend.controllers;

import org.example.backend.models.Message;
import org.example.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@CrossOrigin
public class MessageController {

  @Autowired
  private MessageRepository messageRepository;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @PostMapping("/api/messages")
  public ResponseEntity<Message> createMessage(@RequestBody Message message) {
    message.setCreatedAt(new Date());
    Message savedMessage = messageRepository.save(message);
    messagingTemplate.convertAndSend("/topic/messages", savedMessage);
    return ResponseEntity.ok(savedMessage);
  }

  @GetMapping("/api/messages")
  public ResponseEntity<List<Message>> getAllMessages() {
    return ResponseEntity.ok(messageRepository.findAll());
  }

}
