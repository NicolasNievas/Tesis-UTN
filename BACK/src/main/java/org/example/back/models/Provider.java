package org.example.back.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Provider {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String street;
    private Boolean isActive = true;
}
