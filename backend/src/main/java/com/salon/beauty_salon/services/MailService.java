package com.salon.beauty_salon.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.slf4j.Logger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("d MMMM yyyy, HH:mm");
    private final JavaMailSender mailSender;

    @Async
    public void sendAppointmentConfirmation(String toEmail, String clientFirstName, String serviceName, String employeeFirstName, String employeeLastName, LocalDateTime startTime){

        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Confirmare programare — Beauty Salon");

            String body = "Bună, " + clientFirstName + "!\n\n"
                    + "Programarea ta a fost înregistrată cu succes:\n\n"
                    + "Serviciu: " + serviceName + "\n"
                    + "Specialist: " + employeeFirstName + " " + employeeLastName + "\n"
                    + "Data și ora: " + startTime.format(DATE_FORMAT) + "\n\n"
                    + "Te așteptăm!\n"
                    + "Echipa Beauty Salon";

            helper.setText(body, false);

            mailSender.send(message);
        } catch (MessagingException e){
            log.error("Nu s-a putut trimite emailul de confirmare către {}", toEmail, e);
        }
    }

}
