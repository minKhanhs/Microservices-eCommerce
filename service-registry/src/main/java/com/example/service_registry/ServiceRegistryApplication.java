package com.example.service_registry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableEurekaServer
public class ServiceRegistryApplication {

	static void main(String[] args) {
		SpringApplication.run(ServiceRegistryApplication.class, args);
	}

}
