package org.example.backend.repository;

import org.example.backend.models.PrivateMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateMessageRepository extends MongoRepository<PrivateMessage, String> {
  List<PrivateMessage> findByChatIdOrderByCreatedAtAsc(String chatId);
}
