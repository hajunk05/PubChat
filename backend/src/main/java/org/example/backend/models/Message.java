package org.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
public class Message {

  @Id
  private String id;

  private Date createdAt;
  private String userId;
  private String messageContent;

  public Message(String id, Date createdAt, String userId, String messageContent) {
    this.id = id;
    this.createdAt = createdAt;
    this.userId = userId;
    this.messageContent = messageContent;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getMessageContent() {
    return messageContent;
  }

  public void setMessageContent(String messageContent) {
    this.messageContent = messageContent;
  }

  @Override
  public String toString() {
    return "Message{" +
            "id='" + id + '\'' +
            ", createdAt=" + createdAt +
            ", userId='" + userId + '\'' +
            ", messageContent='" + messageContent + '\'' +
            '}';
  }
}
