package com.claims.service;

import com.claims.entity.Claim;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class LocalAiAnalyzer {

    public void analyze(Claim claim) {

        String text = claim.getDescription() == null
                ? ""
                : claim.getDescription().toLowerCase(Locale.ROOT);

        String type = claim.getClaimType() == null
                ? ""
                : claim.getClaimType().toUpperCase(Locale.ROOT);

        double amount = claim.getEstimatedAmount() == null
                ? 0
                : claim.getEstimatedAmount();

        /*
         * Claim type is treated as the strongest signal.
         * This prevents words such as "accident" inside a
         * medical claim from incorrectly changing it to AUTO.
         */
        String classification = classify(type, text);

        double confidence = calculateConfidence(type, text);

        List<String> flags = new ArrayList<>();
        List<String> signals = new ArrayList<>();

        int fraud = 5;

        // -----------------------------------------
        // Exposure / amount analysis
        // -----------------------------------------

        if (amount >= 750000) {

            fraud += 35;

            flags.add("Very high-value claim");

            signals.add(
                    "Estimated exposure exceeds ₹7,50,000"
            );

        } else if (amount >= 500000) {

            fraud += 25;

            flags.add("High-value claim");

            signals.add(
                    "Estimated exposure exceeds ₹5,00,000"
            );

        } else if (amount >= 200000) {

            fraud += 18;

            flags.add("Elevated claim value");

            signals.add(
                    "Estimated exposure exceeds ₹2,00,000"
            );

        } else if (amount >= 100000) {

            fraud += 8;

            signals.add(
                    "Estimated exposure exceeds ₹1,00,000"
            );
        }


        // -----------------------------------------
        // Suspicious language analysis
        // -----------------------------------------

        String[] suspicious = {
                "forged",
                "fake",
                "fabricated",
                "altered",
                "duplicate",
                "fraud",
                "suspicious",
                "false document",
                "false claim",
                "manipulated"
        };

        for (String word : suspicious) {

            if (text.contains(word)) {

                fraud += 18;

                flags.add(
                        "Suspicious keyword: " + word
                );
            }
        }


        // -----------------------------------------
        // Description quality
        // -----------------------------------------

        if (text.length() < 20) {

            fraud += 10;

            flags.add(
                    "Insufficient claim description"
            );

            signals.add(
                    "Description is too short for reliable assessment"
            );

        } else if (text.length() < 50) {

            signals.add(
                    "Limited narrative detail available"
            );
        }


        // -----------------------------------------
        // Claim type / narrative consistency
        // -----------------------------------------

        if (!matchesType(type, text)) {

            fraud += 12;

            flags.add(
                    "Description/type mismatch"
            );

            signals.add(
                    "Claim type does not strongly match the supplied narrative"
            );
        } else {

            signals.add(
                    "Claim type is consistent with the supplied narrative"
            );
        }


        fraud = Math.min(100, fraud);


        // -----------------------------------------
        // Risk
        // -----------------------------------------

        String risk;

        if (fraud >= 70 || amount >= 750000) {

            risk = "HIGH";

        } else if (fraud >= 35 || amount >= 300000) {

            risk = "MEDIUM";

        } else {

            risk = "LOW";
        }


        // -----------------------------------------
        // Priority
        // -----------------------------------------

        String priority;

        if ("HIGH".equals(risk) || fraud >= 60) {

            priority = "URGENT";

        } else if (
                "MEDIUM".equals(risk)
                        || confidence < 0.80) {

            priority = "REVIEW";

        } else {

            priority = "NORMAL";
        }


        // -----------------------------------------
        // Workflow status
        // -----------------------------------------

        String status;

        if ("HIGH".equals(risk)
                || confidence < 0.75
                || fraud >= 60) {

            status = "REVIEW_REQUIRED";

        } else {

            status = "PROCESSED";
        }


        // -----------------------------------------
        // Recommended action
        // -----------------------------------------

        String action;

        if ("HIGH".equals(risk)) {

            action =
                    "Route to senior claims investigator "
                    + "for detailed fraud, coverage and "
                    + "supporting-document review.";

        } else if ("MEDIUM".equals(risk)) {

            action =
                    "Route to claims analyst for enhanced "
                    + "document and coverage verification.";

        } else if (amount >= 500000) {

            action =
                    "Perform enhanced document and coverage "
                    + "verification before settlement.";

        } else {

            action =
                    "Eligible for straight-through processing; "
                    + "retain audit trail and supporting evidence.";
        }


        // -----------------------------------------
        // Default signals / flags
        // -----------------------------------------

        if (flags.isEmpty()) {

            flags.add(
                    "No significant fraud indicators detected"
            );
        }

        // Avoid duplicate consistency signal
        if (signals.isEmpty()) {

            signals.add(
                    "Claim details are consistent with the supplied claim type"
            );
        }


        // -----------------------------------------
        // AI Summary
        // -----------------------------------------

        String summary = String.format(
                Locale.ROOT,

                "AI assessment: %s claim for customer %s "
                        + "with an estimated value of ₹%,d. "
                        + "The description was classified as %s "
                        + "with %.0f%% confidence. Risk is %s "
                        + "and the fraud-indicator score is %d/100. "
                        + "%s",

                claim.getClaimType(),
                claim.getCustomerId(),
                Math.round(amount),
                classification,
                confidence * 100,
                risk,
                fraud,
                action
        );


        // -----------------------------------------
        // Save AI results
        // -----------------------------------------

        claim.setClassification(classification);
        claim.setConfidenceScore(confidence);
        claim.setRiskLevel(risk);
        claim.setFraudScore(fraud);
        claim.setFraudFlags(
                String.join("|", flags)
        );
        claim.setKeySignals(
                String.join("|", signals)
        );
        claim.setPriority(priority);
        claim.setRecommendedAction(action);
        claim.setSummary(summary);
        claim.setStatus(status);
    }


       
    // CLASSIFICATION
       

    private String classify(
            String type,
            String text) {

        /*
         * Explicit claim type takes priority.
         */
        if ("AUTO".equals(type)) {
            return "AUTO_DAMAGE";
        }

        if ("MEDICAL".equals(type)) {
            return "MEDICAL";
        }

        if ("PROPERTY".equals(type)) {
            return "PROPERTY";
        }

        if ("GENERAL".equals(type)) {
            return "GENERAL";
        }


        /*
         * Fallback text classification when claim type
         * is missing or unknown.
         */

        if (containsAny(
                text,
                "car",
                "vehicle",
                "bumper",
                "windshield",
                "collision",
                "motor"
        )) {

            return "AUTO_DAMAGE";
        }

        if (containsAny(
                text,
                "hospital",
                "medical",
                "treatment",
                "doctor",
                "patient",
                "surgery",
                "medicine",
                "diagnosis"
        )) {

            return "MEDICAL";
        }

        if (containsAny(
                text,
                "house",
                "home",
                "property",
                "building",
                "roof",
                "structural",
                "water leakage"
        )) {

            return "PROPERTY";
        }

        return "GENERAL";
    }


       
    // CONFIDENCE
       

    private double calculateConfidence(
            String type,
            String text) {

        if (text.length() >= 80) {

            return matchesType(type, text)
                    ? 0.97
                    : 0.88;
        }

        if (text.length() >= 40) {

            return matchesType(type, text)
                    ? 0.94
                    : 0.84;
        }

        if (text.length() >= 20) {

            return matchesType(type, text)
                    ? 0.86
                    : 0.76;
        }

        return 0.70;
    }


       
    // TYPE MATCHING
       

    private boolean matchesType(
            String type,
            String text) {

        if ("AUTO".equals(type)) {

            return containsAny(
                    text,
                    "car",
                    "vehicle",
                    "bumper",
                    "windshield",
                    "collision",
                    "motor",
                    "damage"
            );
        }

        if ("MEDICAL".equals(type)) {

            return containsAny(
                    text,
                    "medical",
                    "hospital",
                    "treatment",
                    "doctor",
                    "patient",
                    "surgery",
                    "medicine",
                    "diagnosis",
                    "health"
            );
        }

        if ("PROPERTY".equals(type)) {

            return containsAny(
                    text,
                    "property",
                    "house",
                    "home",
                    "building",
                    "roof",
                    "structural",
                    "water leakage",
                    "damage"
            );
        }

        return true;
    }


       
    // KEYWORD HELPER
       

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}