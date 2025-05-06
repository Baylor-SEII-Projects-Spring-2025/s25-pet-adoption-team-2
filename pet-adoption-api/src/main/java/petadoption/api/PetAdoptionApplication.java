package petadoption.api;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import petadoption.api.admin.AdminPasswordService;

@SpringBootApplication
public class PetAdoptionApplication {

	public static void main(String[] args) {
		SpringApplication.run(PetAdoptionApplication.class, args);
	}

	@Bean
	CommandLineRunner createDefaultAdminPassword(AdminPasswordService adminPasswordService) {
		return args -> {
			adminPasswordService.ensureDefaultPasswordExists();
		};
	}
}