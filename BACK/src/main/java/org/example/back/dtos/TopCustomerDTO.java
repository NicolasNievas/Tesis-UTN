package org.example.back.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopCustomerDTO {
    private Long customerId;
    private String customerName;
    private Long totalOrders;
    private BigDecimal totalSpent;
}
