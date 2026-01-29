package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversionRateDTO {
    private Long completed;
    private Long cancelled;
    private Long pending;
    private Long total;
    private BigDecimal completionRate;
    private BigDecimal cancellationRate;

    public ConversionRateDTO(Long completed, Long cancelled, Long pending, Long total) {
        this.completed = completed;
        this.cancelled = cancelled;
        this.pending = pending;
        this.total = total;

        if (total > 0) {
            this.completionRate = BigDecimal.valueOf(completed)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            this.cancellationRate = BigDecimal.valueOf(cancelled)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else {
            this.completionRate = BigDecimal.ZERO;
            this.cancellationRate = BigDecimal.ZERO;
        }
    }
}
