package org.example.backend.repository;

import org.example.backend.models.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
  List<Message> findTop25ByOrderByCreatedAtDesc();
}
