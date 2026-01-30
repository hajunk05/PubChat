package org.example.backend.controllers;

import org.example.backend.models.PrivateChat;
import org.example.backend.models.PrivateMessage;
import org.example.backend.repository.PrivateChatRepository;
import org.example.backend.repository.PrivateMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@CrossOrigin
public class PrivateChatController {

  @Autowired
  private PrivateChatRepository privateChatRepository;

  @Autowired
  private PrivateMessageRepository privateMessageRepository;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @PostMapping("/api/private-chats")
  public ResponseEntity<PrivateChat> createPrivateChat(@RequestBody PrivateChat chat) {
    chat.setCreatedAt(new Date());
    PrivateChat savedChat = privateChatRepository.save(chat);
    return ResponseEntity.ok(savedChat);
  }

  @GetMapping("/api/private-chats/user/{username}")
  public ResponseEntity<List<PrivateChat>> getUserChats(@PathVariable String username) {
    List<PrivateChat> createdChats = privateChatRepository.findByCreatorUsername(username);
    List<PrivateChat> invitedChats = privateChatRepository.findByInvitedUsername(username);

    List<PrivateChat> allChats = new ArrayList<>();
    allChats.addAll(createdChats);
    allChats.addAll(invitedChats);

    return ResponseEntity.ok(allChats);
  }

  @GetMapping("/api/private-chats/{chatId}")
  public ResponseEntity<PrivateChat> getChat(@PathVariable String chatId) {
    return privateChatRepository.findById(chatId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/api/private-chats/{chatId}/join")
  public ResponseEntity<PrivateChat> joinChat(@PathVariable String chatId, @RequestParam String username) {
    return privateChatRepository.findById(chatId)
        .map(chat -> {
          if (chat.getInvitedUsername() == null || chat.getInvitedUsername().isEmpty()) {
            chat.setInvitedUsername(username);
            PrivateChat savedChat = privateChatRepository.save(chat);
            return ResponseEntity.ok(savedChat);
          }
          return ResponseEntity.ok(chat);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/api/private-chats/{chatId}/messages")
  public ResponseEntity<List<PrivateMessage>> getChatMessages(@PathVariable String chatId) {
    List<PrivateMessage> messages = privateMessageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
    return ResponseEntity.ok(messages);
  }

  @PostMapping("/api/private-chats/{chatId}/messages")
  public ResponseEntity<PrivateMessage> sendMessage(@PathVariable String chatId, @RequestBody PrivateMessage message) {
    message.setChatId(chatId);
    message.setCreatedAt(new Date());
    PrivateMessage savedMessage = privateMessageRepository.save(message);
    messagingTemplate.convertAndSend("/topic/private/" + chatId, savedMessage);
    return ResponseEntity.ok(savedMessage);
  }
}
