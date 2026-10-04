package com.claims.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String claimNumber;

    @Column(nullable = false)
    private String customerId;

    @Column(nullable = false)
    private String claimType;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private Double estimatedAmount;

    private String status;

    private String classification;

    private Double confidenceScore;

    private String riskLevel;

    @Column(length = 4000)
    private String summary;

    private Integer fraudScore;

    @Column(length = 2000)
    private String fraudFlags;

    @Column(length = 2000)
    private String keySignals;

    @Column(length = 1500)
    private String recommendedAction;

    private String priority;

    @Column(length = 2000)
    private String reviewerNote;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    // JPA Lifecycle

    @PrePersist
    void create() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = createdAt;

        if (status == null) {
            status = "AI_PROCESSING";
        }
    }

    @PreUpdate
    void update() {
        updatedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String v) {
        claimNumber = v;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String v) {
        customerId = v;
    }

    public String getClaimType() {
        return claimType;
    }

    public void setClaimType(String v) {
        claimType = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public Double getEstimatedAmount() {
        return estimatedAmount;
    }

    public void setEstimatedAmount(Double v) {
        estimatedAmount = v;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }

    public String getClassification() {
        return classification;
    }

    public void setClassification(String v) {
        classification = v;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double v) {
        confidenceScore = v;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String v) {
        riskLevel = v;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String v) {
        summary = v;
    }

    public Integer getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(Integer v) {
        fraudScore = v;
    }

    public String getFraudFlags() {
        return fraudFlags;
    }

    public void setFraudFlags(String v) {
        fraudFlags = v;
    }

    public String getKeySignals() {
        return keySignals;
    }

    public void setKeySignals(String v) {
        keySignals = v;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String v) {
        recommendedAction = v;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String v) {
        priority = v;
    }

    public String getReviewerNote() {
        return reviewerNote;
    }

    public void setReviewerNote(String v) {
        reviewerNote = v;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String v) {
        reviewedBy = v;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime v) {
        reviewedAt = v;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime v) {
        createdAt = v;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime v) {
        updatedAt = v;
    }
}