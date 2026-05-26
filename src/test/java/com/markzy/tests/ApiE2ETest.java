package com.markzy.tests;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class ApiE2ETest {
    private final String BASE_URL = System.getProperty("baseUrl", "http://localhost:3000");
    private final HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
            
    private String authToken = "";
    private String uniqueEmail = "testuser_" + UUID.randomUUID().toString() + "@example.com";

    // 4. User Onboarding - Registration
    @Test(priority = 1)
    public void testRegistrationApi() throws Exception {
        String jsonPayload = String.format(
            "{\"email\":\"%s\",\"password\":\"Test@123\",\"firstName\":\"API\",\"lastName\":\"Tester\",\"companyName\":\"TestCorp\"}",
            uniqueEmail
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        // Either 200 or 201 is acceptable for registration usually
        Assert.assertTrue(response.statusCode() == 200 || response.statusCode() == 201, 
            "Expected 200 or 201 but got " + response.statusCode() + " - Body: " + response.body());
        Assert.assertTrue(response.body().contains("registered successfully") || response.body().contains("user"), 
            "Response should contain success message / user data");
    }

    // 1. Authentication - User Login
    @Test(priority = 2)
    public void testLoginApi() throws Exception {
        String jsonPayload = String.format(
            "{\"email\":\"%s\",\"password\":\"Test@123\"}",
            uniqueEmail
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        Assert.assertEquals(response.statusCode(), 200, "Login should return 200 OK");
        
        // Extract token manually or using simple string operations since we rely on standard libs
        String body = response.body();
        Assert.assertTrue(body.contains("\"access\""), "Login response should contain access token");
        
        // Quick string parsing to grab the token (using JSON library is better, but this avoids adding pure dependencies if not present)
        int tokenIndex = body.indexOf("\"access\":\"") + 10;
        int tokenEnd = body.indexOf("\"", tokenIndex);
        if (tokenIndex > 9 && tokenEnd > tokenIndex) {
            authToken = body.substring(tokenIndex, tokenEnd);
        }
        
        Assert.assertFalse(authToken.isEmpty(), "Token should not be empty after extraction");
    }

    // 2. User Account - Profile Management
    @Test(priority = 3, dependsOnMethods = "testLoginApi")
    public void testGetUserProfileApi() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/user/profile"))
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        Assert.assertEquals(response.statusCode(), 200, "Profile API should return 200 OK");
        Assert.assertTrue(response.body().contains(uniqueEmail), "Profile response should contain the user's email");
    }

    // 3. Customer Support - Ticket Creation
    @Test(priority = 4, dependsOnMethods = "testLoginApi")
    public void testCreateSupportTicketApi() throws Exception {
        String jsonPayload = "{\"subject\":\"API Test Issue\",\"description\":\"Testing ticket creation\",\"category\":\"technical\",\"priority\":\"high\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/help-center/tickets"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        Assert.assertEquals(response.statusCode(), 200, "Ticket creation API should return 200");
        Assert.assertTrue(response.body().contains("submitted successfully") || response.body().contains("ticket"), 
            "Response should confirm ticket creation");
    }

    // 5. Form Query (POST / GET)
    @Test(priority = 5)
    public void testFormQueryApi() throws Exception {
        // Test POST
        String jsonPayload = "{\"name\":\"API Tester\",\"email\":\"" + uniqueEmail + "\",\"message\":\"Hello from API Test\"}";

        HttpRequest requestPost = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/form-query"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> responsePost = client.send(requestPost, HttpResponse.BodyHandlers.ofString());
        Assert.assertTrue(responsePost.statusCode() == 200 || responsePost.statusCode() == 201, 
            "Form query POST should return 200 or 201");

        // Test GET
        HttpRequest requestGet = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/form-query?limit=5"))
                .header("Authorization", "Bearer " + authToken) // Often form-query GET requires auth
                .GET()
                .build();

        HttpResponse<String> responseGet = client.send(requestGet, HttpResponse.BodyHandlers.ofString());
        Assert.assertEquals(responseGet.statusCode(), 200, "Form query GET should return 200");
        Assert.assertTrue(responseGet.body().contains("API Tester"), "The submitted form query name should be present in GET response");
    }

    // 6. Admin Dashboard - Global Statistics
    @Test(priority = 6, dependsOnMethods = "testLoginApi")
    public void testAdminStatsApi() throws Exception {
        // Assuming admin routes might need admin access; we test if the endpoint is reachable (200 or 401/403 are both valid API responses depending on role)
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/admin/stats"))
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        // Can be 200 if role=user is not blocked by middleware, or 403 Unauthorized if correctly blocked.
        // We assert it didn't crash (500)
        Assert.assertTrue(response.statusCode() != 500, "Admin Stats API should not return 500. Got: " + response.statusCode());
    }
}
