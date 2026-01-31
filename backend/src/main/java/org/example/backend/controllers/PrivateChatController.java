package org.example.backend.controllers;

import org.example.backend.models.PrivateChat;
import org.example.backend.models.PrivateMessage;
import org.example.backend.models.User;
import org.example.backend.repository.PrivateChatRepository;
import org.example.backend.repository.PrivateMessageRepository;
import org.example.backend.repository.UserRepository;
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
  private UserRepository userRepository;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @PostMapping("/api/private-chats")
  public ResponseEntity<?> createPrivateChat(@RequestBody PrivateChat chat) {
    // Check if invited user exists by username
    User invitedUser = userRepository.findFirstByUsername(chat.getInvitedUsername());

    if (invitedUser == null) {
      return ResponseEntity.badRequest().body("User not found");
    }

    // Prevent inviting yourself
    if (chat.getCreatorUsername().equals(chat.getInvitedUsername())) {
      return ResponseEntity.badRequest().body("Cannot invite yourself");
    }

    // Check if chat already exists between these two users (in either direction)
    List<PrivateChat> existingChats1 = privateChatRepository.findByCreatorUsernameAndInvitedUsername(
        chat.getCreatorUsername(), chat.getInvitedUsername());
    List<PrivateChat> existingChats2 = privateChatRepository.findByCreatorUsernameAndInvitedUsername(
        chat.getInvitedUsername(), chat.getCreatorUsername());

    // Filter out declined chats - only block if pending or accepted
    boolean hasActiveChat = existingChats1.stream().anyMatch(c -> !"declined".equals(c.getStatus()))
        || existingChats2.stream().anyMatch(c -> !"declined".equals(c.getStatus()));

    if (hasActiveChat) {
      return ResponseEntity.badRequest().body("Chat already exists with this user");
    }

    chat.setCreatedAt(new Date());
    chat.setStatus("pending");

    PrivateChat savedChat = privateChatRepository.save(chat);

    // Notify the invited user via WebSocket
    String topic = "/topic/user/" + invitedUser.getUsername() + "/invites";
    messagingTemplate.convertAndSend(topic, savedChat);

    return ResponseEntity.ok(savedChat);
  }

  @GetMapping("/api/private-chats/user/{username}")
  public ResponseEntity<List<PrivateChat>> getUserChats(@PathVariable String username) {
    // Get accepted chats where user is creator
    List<PrivateChat> createdChats = privateChatRepository.findByCreatorUsernameAndStatus(username, "accepted");
    // Get accepted chats where user is invited
    List<PrivateChat> invitedChats = privateChatRepository.findByInvitedUsernameAndStatus(username, "accepted");

    List<PrivateChat> allChats = new ArrayList<>();
    allChats.addAll(createdChats);
    allChats.addAll(invitedChats);

    return ResponseEntity.ok(allChats);
  }

  @GetMapping("/api/private-chats/user/{username}/pending")
  public ResponseEntity<List<PrivateChat>> getPendingInvites(@PathVariable String username) {
    // Get pending invites where user is the invited one
    List<PrivateChat> pendingInvites = privateChatRepository.findByInvitedUsernameAndStatus(username, "pending");
    return ResponseEntity.ok(pendingInvites);
  }

  @PostMapping("/api/private-chats/{chatId}/accept")
  public ResponseEntity<PrivateChat> acceptInvite(@PathVariable String chatId, @RequestParam String username) {
    return privateChatRepository.findById(chatId)
        .map(chat -> {
          if (!username.equals(chat.getInvitedUsername())) {
            return ResponseEntity.badRequest().<PrivateChat>body(null);
          }
          chat.setStatus("accepted");
          PrivateChat savedChat = privateChatRepository.save(chat);

          // Notify the creator that the invite was accepted
          messagingTemplate.convertAndSend("/topic/user/" + chat.getCreatorUsername() + "/chats", savedChat);

          return ResponseEntity.ok(savedChat);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/api/private-chats/{chatId}/decline")
  public ResponseEntity<?> declineInvite(@PathVariable String chatId, @RequestParam String username) {
    return privateChatRepository.findById(chatId)
        .map(chat -> {
          if (!username.equals(chat.getInvitedUsername())) {
            return ResponseEntity.badRequest().body("Not authorized");
          }
          chat.setStatus("declined");
          privateChatRepository.save(chat);
          return ResponseEntity.ok().build();
        })
        .orElse(ResponseEntity.notFound().build());
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

  @DeleteMapping("/api/private-chats/{chatId}")
  public ResponseEntity<?> deleteChat(@PathVariable String chatId) {
    return privateChatRepository.findById(chatId)
        .map(chat -> {
          // Delete all messages in the chat
          List<PrivateMessage> messages = privateMessageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
          privateMessageRepository.deleteAll(messages);

          // Notify both users about the deletion
          messagingTemplate.convertAndSend("/topic/user/" + chat.getCreatorUsername() + "/chat-deleted", chatId);
          if (chat.getInvitedUsername() != null) {
            messagingTemplate.convertAndSend("/topic/user/" + chat.getInvitedUsername() + "/chat-deleted", chatId);
          }

          // Delete the chat
          privateChatRepository.deleteById(chatId);
          return ResponseEntity.ok().build();
        })
        .orElse(ResponseEntity.notFound().build());
  }
}
