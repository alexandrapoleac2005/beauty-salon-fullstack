package com.salon.beauty_salon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableAsync
public class BeautySalonApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeautySalonApplication.class, args);
	}

}
