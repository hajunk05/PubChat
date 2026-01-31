package org.example.backend.repository;

import org.example.backend.models.PrivateChat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateChatRepository extends MongoRepository<PrivateChat, String> {
  List<PrivateChat> findByCreatorUsername(String creatorUsername);
  List<PrivateChat> findByInvitedUsername(String invitedUsername);
  List<PrivateChat> findByInvitedEmail(String invitedEmail);
  List<PrivateChat> findByCreatorUsernameAndStatus(String creatorUsername, String status);
  List<PrivateChat> findByInvitedUsernameAndStatus(String invitedUsername, String status);
  List<PrivateChat> findByCreatorUsernameAndInvitedUsername(String creatorUsername, String invitedUsername);
}
