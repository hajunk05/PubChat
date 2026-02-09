package org.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
public class PrivateChat {

  @Id
  private String id;

  private String creatorUsername;
  private String invitedUsername;
  private Date createdAt;
  private String status; // pending, accepted, declined

  public PrivateChat() {}

  public PrivateChat(String id, String creatorUsername, String invitedUsername, Date createdAt) {
    this.id = id;
    this.creatorUsername = creatorUsername;
    this.invitedUsername = invitedUsername;
    this.createdAt = createdAt;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getCreatorUsername() {
    return creatorUsername;
  }

  public void setCreatorUsername(String creatorUsername) {
    this.creatorUsername = creatorUsername;
  }

  public String getInvitedUsername() {
    return invitedUsername;
  }

  public void setInvitedUsername(String invitedUsername) {
    this.invitedUsername = invitedUsername;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
