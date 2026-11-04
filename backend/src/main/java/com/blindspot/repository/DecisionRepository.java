package com.blindspot.repository;

import com.blindspot.model.DecisionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DecisionRepository extends MongoRepository<DecisionDocument, String> {

    List<DecisionDocument> findByUserIdOrderByCreatedAtDesc(String userId);

    List<DecisionDocument> findAllByOrderByCreatedAtDesc();

    Optional<DecisionDocument> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
