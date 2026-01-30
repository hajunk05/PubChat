package org.example.backend.repository;

import org.example.backend.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserRepository extends MongoRepository<User, String> {
  User findFirstByUsername(String username);
  User findFirstByEmail(String email);
}


