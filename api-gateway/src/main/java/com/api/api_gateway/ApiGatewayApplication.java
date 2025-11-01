package com.api.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiGatewayApplication {

	static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
