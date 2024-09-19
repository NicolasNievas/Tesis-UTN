package org.example.back.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ErrorApi {

    private String timestamp;

    private Integer status;

    private String error;

    private String message;
}
