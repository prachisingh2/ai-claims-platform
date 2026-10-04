package com.claims.dto;

public record DashboardSummary(
        long totalClaims,
        long aiProcessing,
        long reviewQueue,
        long processed,
        long highRisk,
        long mediumRisk,
        long lowRisk,
        long highFraud,
        double averageConfidence,
        double totalEstimatedAmount) {
}
