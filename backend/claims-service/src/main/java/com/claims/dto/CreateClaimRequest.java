package com.claims.dto;

import jakarta.validation.constraints.*;

public record CreateClaimRequest(
        @NotBlank String customerId,
        @NotBlank String claimType,
        @NotBlank @Size(max = 4000) String description,
        @PositiveOrZero Double estimatedAmount) {
}
