package petadoption.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // serve any request under /uploads/** from the local uploads/ folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
