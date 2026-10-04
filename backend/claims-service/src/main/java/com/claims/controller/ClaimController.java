package com.claims.controller;

import com.claims.dto.AiInsight;
import com.claims.dto.CreateClaimRequest;
import com.claims.dto.DashboardSummary;
import com.claims.dto.ReviewClaimRequest;
import com.claims.entity.Claim;
import com.claims.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimController {

    private final ClaimService service;

    public ClaimController(ClaimService service) {
        this.service = service;
    }

    // ADMIN + CLAIMER
    @PostMapping("/claims")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public Claim create(
            @Valid @RequestBody CreateClaimRequest request) {

        return service.create(request);
    }

    // ADMIN + CLAIMER
    @GetMapping("/claims")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMER')")
    public List<Claim> all() {
        return service.findAll();
    }

    // ADMIN + CLAIMER
    @GetMapping("/claims/{claimNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMER')")
    public Claim get(
            @PathVariable String claimNumber) {

        return service.find(claimNumber);
    }

    // ADMIN + CLAIMER
    @GetMapping("/claims/{claimNumber}/ai-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIMER')")
    public AiInsight aiSummary(
            @PathVariable String claimNumber) {

        return service.insight(claimNumber);
    }

    // ADMIN ONLY
    @PostMapping("/claims/{claimNumber}/reprocess")
    @PreAuthorize("hasRole('ADMIN')")
    public Claim reprocess(
            @PathVariable String claimNumber) {

        return service.reprocess(claimNumber);
    }

    // ADMIN ONLY
    @PostMapping("/claims/{claimNumber}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public Claim review(
            @PathVariable String claimNumber,
            @Valid @RequestBody ReviewClaimRequest request) {

        return service.review(claimNumber, request);
    }

    // ADMIN ONLY
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardSummary dashboard() {
        return service.dashboard();
    }
}