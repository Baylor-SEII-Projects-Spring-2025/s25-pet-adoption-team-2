package petadoption.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import petadoption.api.admin.AdminPasswordService;

/**
 * Handles initialization tasks when the application starts up
 */
@Component
public class ApplicationStartupConfig implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private AdminPasswordService adminPasswordService;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Ensure default admin password exists
        adminPasswordService.ensureDefaultPasswordExists();
    }
}