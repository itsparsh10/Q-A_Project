package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class ProfileManagementTest extends BaseTest {

    @Test
    public void testProfileUpdateFlow() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;

        // 1. Login
        driver.get(BASE_URL + "/login");
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete'"));
        Thread.sleep(1000);

        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
        emailField.clear();
        emailField.sendKeys("hello@gmail.com");
        
        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.clear();
        passwordField.sendKeys("Hello*123");
        
        WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']")));
        js.executeScript("arguments[0].click();", loginBtn);

        // Wait for redirect
        wait.until(ExpectedConditions.or(
            ExpectedConditions.urlContains("/dashboard"),
            ExpectedConditions.urlContains("/all-tools")
        ));

        // 2. Navigate to Account Page
        driver.get(BASE_URL + "/account");
        wait.until(ExpectedConditions.urlContains("/account"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Account Settings')]")));

        // 3. Start Editing
        WebElement editBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Edit Profile')]")));
        js.executeScript("arguments[0].click();", editBtn);

        // 4. Update Profile Fields with randomized data
        long timestamp = System.currentTimeMillis();
        String[] firstNames = {"Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"};
        String[] jobTitles = {"Developer", "Designer", "Product Manager", "QA Engineer", "Data Scientist", "Marketing Lead"};
        String[] websites = {"https://test-site.com", "https://automation-hub.io", "https://markzy-testing.ai", "https://dev-portal.net"};

        java.util.Random random = new java.util.Random();
        String newFirstName = firstNames[random.nextInt(firstNames.length)] + timestamp % 1000;
        String newLastName = lastNames[random.nextInt(lastNames.length)];
        String newEmail = "testuser" + timestamp + "@example.com";
        String newCompany = "Company " + (100 + random.nextInt(900)) + " " + timestamp % 10000;
        String newJobTitle = jobTitles[random.nextInt(jobTitles.length)];
        String newWebsite = websites[random.nextInt(websites.length)];

        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='Enter your first name']")));
        firstNameInput.clear();
        firstNameInput.sendKeys(newFirstName);

        WebElement lastNameInput = driver.findElement(By.xpath("//input[@placeholder='Enter your last name']"));
        lastNameInput.clear();
        lastNameInput.sendKeys(newLastName);

        WebElement emailInput = driver.findElement(By.xpath("//input[@placeholder='your.email@example.com']"));
        emailInput.clear();
        emailInput.sendKeys(newEmail);

        WebElement companyInput = driver.findElement(By.xpath("//input[@placeholder='Your company name']"));
        companyInput.clear();
        companyInput.sendKeys(newCompany);

        WebElement jobTitleInput = driver.findElement(By.xpath("//input[@placeholder='Your job title']"));
        jobTitleInput.clear();
        jobTitleInput.sendKeys(newJobTitle);

        WebElement websiteInput = driver.findElement(By.xpath("//input[@placeholder='https://yourwebsite.com']"));
        websiteInput.clear();
        websiteInput.sendKeys(newWebsite);

        // 5. Save Changes
        WebElement saveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Save Changes')]")));
        js.executeScript("arguments[0].click();", saveBtn);

        // 6. Verify Success Toastify Notification
        System.out.println("Waiting for success toast notification...");
        WebElement successToast = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//div[contains(@class, 'Toastify__toast--success')]")
        ));
        
        String toastText = successToast.getText();
        System.out.println("Toast received: " + toastText);
        Assert.assertTrue(toastText.toLowerCase().contains("successfully") || toastText.toLowerCase().contains("saved"), 
            "Expected success message but got: " + toastText);

        // 7. Verify changes reflect in the read-only view
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//input[@placeholder='Enter your first name']")));
        
        System.out.println("Verifying updated data: " + newFirstName + " " + newLastName + ", " + newCompany + ", " + newJobTitle);

        WebElement fullNameDisplay = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//p[contains(text(), '" + newFirstName + " " + newLastName + "')]")));
        Assert.assertNotNull(fullNameDisplay, "Updated full name should be visible");

        WebElement emailDisplay = driver.findElement(By.xpath("//p[contains(text(), '" + newEmail + "')]"));
        Assert.assertNotNull(emailDisplay, "Updated email should be visible");

        WebElement companyDisplay = driver.findElement(By.xpath("//p[contains(text(), '" + newCompany + "')]"));
        Assert.assertNotNull(companyDisplay, "Updated company name should be visible");

        WebElement jobTitleDisplay = driver.findElement(By.xpath("//p[contains(text(), '" + newJobTitle + "')]"));
        Assert.assertNotNull(jobTitleDisplay, "Updated job title should be visible");
        
        System.out.println("✅ Profile management test with randomized data passed successfully!");
    }
}
