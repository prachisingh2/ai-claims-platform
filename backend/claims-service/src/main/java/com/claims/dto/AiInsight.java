package com.claims.dto;

public record AiInsight(
        String summary,
        String classification,
        double confidence,
        String riskLevel,
        int fraudScore,
        String[] fraudFlags,
        String[] keySignals,
        String recommendedAction,
        String priority) {
}
