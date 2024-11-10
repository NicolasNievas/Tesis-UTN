package org.example.back.dtos.response;

import lombok.*;
import org.example.back.models.DeliveryDetailResponse;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long invoiceId;
    private LocalDate deliveryDate;
    private Double totalAmount;
    private List<DeliveryDetailResponse> details;
}
