package org.example.back.initializer;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.PaymentMethodEntity;
import org.example.back.repositories.PaymentMethodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class PaymentMethodInitializer implements CommandLineRunner {
    private final PaymentMethodRepository paymentMethodRepository;

    @Override
    public void run(String... args) {
        if (paymentMethodRepository.count() == 0) {
            PaymentMethodEntity creditCard = new PaymentMethodEntity();
            creditCard.setName("CREDIT_CARD");

            PaymentMethodEntity debitCard = new PaymentMethodEntity();
            debitCard.setName("DEBIT_CARD");

            PaymentMethodEntity accountMoney = new PaymentMethodEntity();
            accountMoney.setName("ACCOUNT_MONEY");

            paymentMethodRepository.saveAll(Arrays.asList(creditCard, debitCard, accountMoney));
        }
    }
}
