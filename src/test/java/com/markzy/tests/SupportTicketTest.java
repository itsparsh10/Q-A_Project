package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class SupportTicketTest extends BaseTest {

    @Test
    public void testTicketCreationFlow() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;

        // 1. Login
        driver.get(BASE_URL + "/login");
        
        // Wait for page hydration - check for a common React indicator or just document ready
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete'"));
        Thread.sleep(1000); // Small pause for hydration

        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
        emailField.clear();
        emailField.sendKeys("hello@gmail.com");
        
        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.clear();
        passwordField.sendKeys("Hello*123");
        
        // Click elsewhere to trigger blur
        driver.findElement(By.tagName("h1")).click();

        WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']")));
        
        // Use JS to click to be absolutely sure we trigger the React handler
        js.executeScript("arguments[0].click();", loginBtn);

        // Wait for redirect to dashboard
        wait.until(ExpectedConditions.or(
            ExpectedConditions.urlContains("/dashboard"),
            ExpectedConditions.urlContains("/all-tools")
        ));
        
        System.out.println("Login successful, redirected to: " + driver.getCurrentUrl());

        // 2. Navigate to Help Center
        driver.get(BASE_URL + "/help-center");
        wait.until(ExpectedConditions.urlContains("/help-center"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Help Center')]")));

        // 3. Click "Submit Ticket"
        // Try multiple selectors for the button that opens the form
        WebElement openFormBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Submit Ticket') or contains(., 'Get Help Now')]")));
        js.executeScript("arguments[0].click();", openFormBtn);

        // 4. Fill the form
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h3[contains(text(), 'Submit a Support Ticket')]")));

        WebElement nameInput = driver.findElement(By.xpath("//input[@placeholder='Enter your full name']"));
        nameInput.clear();
        nameInput.sendKeys("Test User");

        WebElement emailInput = driver.findElement(By.xpath("//input[@placeholder='Enter your email address']"));
        emailInput.clear();
        emailInput.sendKeys("hello@gmail.com");

        // Use a more robust way to select from dropdowns
        WebElement catSelectElem = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//select[contains(., 'Select a category') or contains(., 'Account')]")));
        Select categorySelect = new Select(catSelectElem);
        categorySelect.selectByValue("technical");

        WebElement prioSelectElem = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//select[option[@value='high']]")));
        Select prioritySelect = new Select(prioSelectElem);
        prioritySelect.selectByValue("high");

        String subject = "Selenium Test Ticket " + System.currentTimeMillis();
        driver.findElement(By.xpath("//input[@placeholder='Brief description of your issue']")).sendKeys(subject);
        driver.findElement(By.xpath("//textarea[@placeholder='Please provide detailed information about your issue or question']")).sendKeys("This is a test ticket created by Selenium automation script.");

        // 5. Submit the form
        WebElement finalSubmitBtn = driver.findElement(By.xpath("//button[@type='submit' and contains(., 'Submit Ticket')]"));
        js.executeScript("arguments[0].scrollIntoView(true);", finalSubmitBtn);
        wait.until(ExpectedConditions.elementToBeClickable(finalSubmitBtn));
        
        System.out.println("Submitting support ticket...");
        js.executeScript("arguments[0].click();", finalSubmitBtn);

        // 6. Verify success toast notification and end test
        System.out.println("Waiting for success toast notification...");
        WebElement successToast = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//div[contains(@class, 'Toastify__toast--success')]")
        ));
        
        String toastText = successToast.getText();
        System.out.println("Toast received: " + toastText);
        Assert.assertTrue(toastText.toLowerCase().contains("submitted") || toastText.toLowerCase().contains("success"), 
            "Expected success message but got: " + toastText);
        
        System.out.println("✅ Support ticket submitted successfully. Test complete.");
    }
}
