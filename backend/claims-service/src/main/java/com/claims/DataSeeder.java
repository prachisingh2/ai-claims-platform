package com.claims;

import com.claims.entity.Claim;
import com.claims.repository.ClaimRepository;

// import io.micrometer.common.lang.NonNull;

import org.springframework.lang.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

        private final ClaimRepository repository;

        private final Random random = new Random(42);

        public DataSeeder(ClaimRepository repository) {
                this.repository = repository;
        }

        @Override
        public void run(String... args) {

        // Seed demo claims only once.
        if (repository.count() > 0) {
                System.out.println("Claims already exist. Skipping claim seeding.");
                return;
        }

        System.out.println("Seeding 150 demo claims...");

        for (int i = 1; i <= 150; i++) {
                Claim claim = createClaim(i);
                repository.save(claim);
        }

        System.out.println("Claims created successfully.");
        }
        

        @NonNull
        private Claim createClaim(int index) {

                String[] types = {
                                "AUTO",
                                "MEDICAL",
                                "PROPERTY",
                                "GENERAL"
                };

                String type = types[index % types.length];

                Claim claim = new Claim();

                claim.setClaimNumber(
                                String.format("CLM-%06d", 100000 + index));

                claim.setCustomerId(
                                String.format("CUST-%05d", 10000 + index));

                claim.setClaimType(type);

                claim.setDescription(
                                descriptionFor(type, index));

                double amount = 15000 +
                                random.nextInt(985000);

                claim.setEstimatedAmount(amount);

                double confidence = 0.76 +
                                (random.nextDouble() * 0.23);

                claim.setConfidenceScore(
                                Math.round(confidence * 100.0) / 100.0);

                int fraudScore = random.nextInt(101);

                claim.setFraudScore(fraudScore);

                String risk;

                if (fraudScore >= 75) {
                        risk = "HIGH";
                } else if (fraudScore >= 45) {
                        risk = "MEDIUM";
                } else {
                        risk = "LOW";
                }

                claim.setRiskLevel(risk);

                claim.setClassification(
                                classificationFor(type));

                claim.setPriority(
                                priorityFor(risk, amount));

                claim.setSummary(
                                summaryFor(type, risk, amount));

                claim.setRecommendedAction(
                                actionFor(risk, amount));

                claim.setKeySignals(
                                signalsFor(type, amount));

                claim.setFraudFlags(
                                fraudFlagsFor(fraudScore));

                /*
                 * Create realistic workflow distribution.
                 */
                int statusBucket = index % 20;

                if (statusBucket < 9) {
                        claim.setStatus("PROCESSED");
                } else if (statusBucket < 14) {
                        claim.setStatus("REVIEW_REQUIRED");
                } else if (statusBucket < 18) {
                        claim.setStatus("APPROVED");
                } else {
                        claim.setStatus("REJECTED");
                }

                if (claim.getStatus().equals("APPROVED") ||
                                claim.getStatus().equals("REJECTED")) {
                        claim.setReviewedBy(
                                        "Claims Analyst");

                        claim.setReviewerNote(
                                        claim.getStatus().equals("APPROVED")
                                                        ? "Approved after analyst review."
                                                        : "Rejected after analyst review.");

                        claim.setReviewedAt(
                                        LocalDateTime.now().minusDays(random.nextInt(30)));
                }

                LocalDateTime created = LocalDateTime.now()
                                .minusDays(
                                                random.nextInt(90))
                                .minusHours(
                                                random.nextInt(24));

                claim.setCreatedAt(created);
                claim.setUpdatedAt(created.plusHours(2));

                return claim;
        }

        private String classificationFor(
                        String type) {

                return switch (type) {

                        case "AUTO" ->
                                "AUTO_DAMAGE";

                        case "MEDICAL" ->
                                "MEDICAL";

                        case "PROPERTY" ->
                                "PROPERTY";

                        default ->
                                "GENERAL";
                };
        }

        private String descriptionFor(
                        String type,
                        int index) {

                return switch (type) {

                        case "AUTO" ->
                                "Vehicle collision claim involving "
                                                + "front body damage, windshield impact "
                                                + "and repair assessment for insured vehicle "
                                                + "reported by customer "
                                                + index + ".";

                        case "MEDICAL" ->
                                "Medical reimbursement claim for "
                                                + "hospital treatment, diagnostic procedures "
                                                + "and prescribed medication submitted "
                                                + "with supporting medical documents.";

                        case "PROPERTY" ->
                                "Property damage claim involving "
                                                + "water leakage, structural damage and "
                                                + "repair expenses reported at the insured "
                                                + "residential property.";

                        default ->
                                "General insurance claim submitted for "
                                                + "unexpected financial loss with supporting "
                                                + "documents provided for assessment.";
                };
        }

        private String priorityFor(
                        String risk,
                        double amount) {

                if ("HIGH".equals(risk) ||
                                amount > 750000) {
                        return "URGENT";
                }

                if ("MEDIUM".equals(risk) ||
                                amount > 300000) {
                        return "REVIEW";
                }

                return "NORMAL";
        }

        private String summaryFor(
                        String type,
                        String risk,
                        double amount) {

                return String.format(
                                "%s claim with estimated exposure "
                                                + "of ₹%,.0f. AI assessment indicates "
                                                + "%s risk and recommends analyst "
                                                + "attention according to the detected "
                                                + "claim characteristics.",
                                classificationFor(type),
                                amount,
                                risk.toLowerCase());
        }

        private String actionFor(
                        String risk,
                        double amount) {

                if ("HIGH".equals(risk)) {
                        return "Route to senior claims analyst "
                                        + "for detailed fraud and coverage review.";
                }

                if (amount > 500000) {
                        return "Perform enhanced document and "
                                        + "coverage verification before settlement.";
                }

                return "Continue standard claims processing "
                                + "with automated verification.";
        }

        private String signalsFor(
                        String type,
                        double amount) {

                return String.join(
                                ";",
                                "Claim type matches submitted narrative",
                                "Estimated exposure ₹"
                                                + String.format("%,.0f", amount),
                                "Supporting claim information detected",
                                type + " workflow identified");
        }

        private String fraudFlagsFor(
                        int score) {

                if (score >= 75) {
                        return String.join(
                                        ";",
                                        "High fraud score",
                                        "Requires enhanced verification",
                                        "Potential inconsistency detected");
                }

                if (score >= 45) {
                        return String.join(
                                        ";",
                                        "Moderate fraud score",
                                        "Additional document verification recommended");
                }

                return "No significant fraud indicators detected";
        }
}