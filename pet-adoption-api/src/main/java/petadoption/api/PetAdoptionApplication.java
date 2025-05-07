package petadoption.api;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import petadoption.api.admin.AdminPasswordService;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;

@SpringBootApplication
public class PetAdoptionApplication {

	public static void main(String[] args) {
		// Add logging for application startup
		try {
			FileWriter fw = new FileWriter("app-error.log", true);
			fw.write(new Date().toString() + ": Application started\n");
			fw.close();
		} catch (IOException e) {
			System.out.println("Cannot write to log file");
		}

		SpringApplication.run(PetAdoptionApplication.class, args);
	}

	@Bean
	CommandLineRunner createDefaultAdminPassword(AdminPasswordService adminPasswordService) {
		return args -> {
			adminPasswordService.ensureDefaultPasswordExists();
		};
	}
}