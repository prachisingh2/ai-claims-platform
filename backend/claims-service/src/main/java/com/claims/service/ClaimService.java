package com.claims.service;

import com.claims.dto.*;
import com.claims.entity.Claim;
import com.claims.entity.Role;
import com.claims.entity.User;
import com.claims.repository.ClaimRepository;
import com.claims.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClaimService {

    private final ClaimRepository repository;
    private final UserRepository userRepository;
    private final LocalAiAnalyzer aiAnalyzer;

    public ClaimService(
            ClaimRepository repository,
            UserRepository userRepository,
            LocalAiAnalyzer aiAnalyzer) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.aiAnalyzer = aiAnalyzer;
    }

    // CREATE CLAIM
    public Claim create(CreateClaimRequest request) {

        User currentUser = getCurrentUser();

        Claim claim = new Claim();

        claim.setClaimNumber(
                "CLM-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        /*
         * ADMIN can create a claim for any customer.
         *
         * CLAIMER can only create a claim for their
         * own customer ID.
         */
        if (currentUser.getRole() == Role.ADMIN) {

            claim.setCustomerId(request.customerId());

        } else {

            String customerId = currentUser.getCustomerId();

            if (customerId == null || customerId.isBlank()) {
                throw new IllegalStateException(
                        "Claimer account is not associated with a customer ID"
                );
            }

            claim.setCustomerId(customerId);
        }

        claim.setClaimType(request.claimType());
        claim.setDescription(request.description());
        claim.setEstimatedAmount(request.estimatedAmount());
        claim.setStatus("AI_PROCESSING");

        claim = repository.save(claim);

        aiAnalyzer.analyze(claim);

        return repository.save(claim);
    }


    // GET CLAIMS
    public List<Claim> findAll() {

        User currentUser = getCurrentUser();

        /*
         * ADMIN → all claims
         */
        if (currentUser.getRole() == Role.ADMIN) {
            return repository.findAll();
        }

        /*
         * CLAIMER → only their own claims
         */
        String customerId = currentUser.getCustomerId();

        if (customerId == null || customerId.isBlank()) {
            throw new IllegalStateException(
                    "Claimer account is not associated with a customer ID"
            );
        }

        return repository.findByCustomerId(customerId);
    }


    // GET SINGLE CLAIM
    public Claim find(String claimNumber) {

        Claim claim = repository.findByClaimNumber(claimNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Claim not found: " + claimNumber
                        )
                );

        /*
         * ADMIN can access any claim.
         */
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return claim;
        }

        /*
         * CLAIMER can only access their own claim.
         */
        String customerId = currentUser.getCustomerId();

        if (customerId == null ||
                !customerId.equals(claim.getCustomerId())) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "You do not have access to this claim"
            );
        }

        return claim;
    }


    // AI REPROCESS
    public Claim reprocess(String claimNumber) {

        /*
         * ClaimController already restricts this endpoint
         * to ADMIN.
         */
        Claim claim = find(claimNumber);

        claim.setStatus("AI_PROCESSING");

        repository.save(claim);

        aiAnalyzer.analyze(claim);

        return repository.save(claim);
    }

    // AI INSIGHT
    public AiInsight insight(String claimNumber) {

        /*
         * find() performs ownership validation.
         */
        Claim c = find(claimNumber);

        return new AiInsight(
                c.getSummary(),
                c.getClassification(),
                n(c.getConfidenceScore()),
                c.getRiskLevel(),
                c.getFraudScore() == null
                        ? 0
                        : c.getFraudScore(),
                split(c.getFraudFlags()),
                split(c.getKeySignals()),
                c.getRecommendedAction(),
                c.getPriority()
        );
    }

    // REVIEW CLAIM
    public Claim review(
            String claimNumber,
            ReviewClaimRequest request) {

        /*
         * ClaimController already restricts this endpoint
         * to ADMIN.
         */
        Claim claim = find(claimNumber);

        String status =
                request.status()
                        .trim()
                        .toUpperCase();

        if (!List.of(
                "APPROVED",
                "REJECTED",
                "REVIEW_REQUIRED"
        ).contains(status)) {

            throw new IllegalArgumentException(
                    "Unsupported review status"
            );
        }

        claim.setStatus(status);

        claim.setReviewerNote(
                request.note()
        );

        claim.setReviewedBy(
                request.reviewedBy() == null ||
                request.reviewedBy().isBlank()
                        ? "Claims Analyst"
                        : request.reviewedBy()
        );

        claim.setReviewedAt(
                LocalDateTime.now()
        );

        return repository.save(claim);
    }


    // ADMIN DASHBOARD
    public DashboardSummary dashboard() {

        /*
         * ClaimController restricts this endpoint to ADMIN.
         */
        List<Claim> all = repository.findAll();

        long total = all.size();

        long processing = all.stream()
                .filter(c ->
                        "AI_PROCESSING"
                                .equals(c.getStatus()))
                .count();

        long review = all.stream()
                .filter(c ->
                        "REVIEW_REQUIRED"
                                .equals(c.getStatus()))
                .count();

        long processed = all.stream()
                .filter(c ->
                        "PROCESSED"
                                .equals(c.getStatus()))
                .count();

        long high = all.stream()
                .filter(c ->
                        "HIGH"
                                .equals(c.getRiskLevel()))
                .count();

        long medium = all.stream()
                .filter(c ->
                        "MEDIUM"
                                .equals(c.getRiskLevel()))
                .count();

        long low = all.stream()
                .filter(c ->
                        "LOW"
                                .equals(c.getRiskLevel()))
                .count();

        long highFraud = all.stream()
                .filter(c ->
                        c.getFraudScore() != null &&
                        c.getFraudScore() >= 55)
                .count();

            double avg = all.stream()
                .map(c -> c.getConfidenceScore())
                .filter(x -> x != null)
                .mapToDouble(x -> x)
                .average()
                .orElse(0.0);


            double amount = all.stream()
                .map(c -> c.getEstimatedAmount())
                .filter(x -> x != null)
                .mapToDouble(x -> x)
                .sum();

        return new DashboardSummary(
                total,
                processing,
                review,
                processed,
                high,
                medium,
                low,
                highFraud,
                avg,
                amount
        );
    }


    // CURRENT USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new org.springframework.security.access.AccessDeniedException(
                                "Authenticated user not found"
                        )
                );
    }


    // HELPERS
    private double n(Double x) {
        return x == null ? 0 : x;
    }


    private String[] split(String x) {

        if (x == null || x.isBlank()) {
            return new String[0];
        }

        return x.split(";");
    }
}