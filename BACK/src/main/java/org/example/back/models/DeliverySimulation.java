package org.example.back.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliverySimulation {
    private List<DeliverySimulationDetail> details;
    private int delayDays;
}
