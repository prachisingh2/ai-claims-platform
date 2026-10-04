package com.claims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewClaimRequest(
        @NotBlank String status,
        @Size(max = 2000) String note,
        @Size(max = 120) String reviewedBy) {
}
