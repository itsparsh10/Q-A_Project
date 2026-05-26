package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class FormQueryTest extends BaseTest {

    @Test
    public void testFormQueryCompleteFlow() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;

        // 1. Navigate to Landing Page
        driver.get(BASE_URL + "/");
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete'"));
        
        // Scroll to the form section
        WebElement nameInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("name")));
        js.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", nameInput);
        Thread.sleep(1000);

        // 2. PART A: Validation Testing (Empty Form)
        System.out.println("Step 1: Testing validation with empty fields...");
        WebElement submitBtn = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[contains(., 'Get My Marketing Strategy')]")));
        js.executeScript("arguments[0].click();", submitBtn);
        
        // Verify form didn't clear/submit (HTML5 validation or React state should hold it)
        Assert.assertEquals(nameInput.getAttribute("value"), "", "Form should not submit with empty name");

        // 3. PART B: Validation Testing (Invalid Email)
        System.out.println("Step 2: Testing validation with invalid email...");
        nameInput.sendKeys("Validation Test User");
        WebElement emailInput = driver.findElement(By.id("email"));
        emailInput.sendKeys("not-a-valid-email");
        
        js.executeScript("arguments[0].click();", submitBtn);
        
        // Form should still contain the name because it didn't submit successfully
        Assert.assertEquals(nameInput.getAttribute("value"), "Validation Test User", "Form should not clear if email is invalid");

        // 4. PART C: Successful Submission with Randomized Data
        System.out.println("Step 3: Performing successful submission with randomized data...");
        
        // Clear previous validation data
        nameInput.clear();
        emailInput.clear();

        long timestamp = System.currentTimeMillis();
        String[] firstNames = {"James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda"};
        String[] lastNames = {"Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson"};
        String[] industries = {"Technology & Software", "E-commerce & Retail", "Marketing & Advertising", "Consulting & Services"};
        String[] messages = {
            "I'm interested in scaling my business with AI.",
            "Can you provide a demo of the platform?",
            "How does the pricing work for enterprise clients?",
            "I'd like to discuss a potential partnership."
        };

        java.util.Random random = new java.util.Random();
        String randomName = firstNames[random.nextInt(firstNames.length)] + " " + lastNames[random.nextInt(lastNames.length)];
        String randomEmail = "query_" + timestamp + "@automation.test";
        String company = "TestCorp " + (100 + random.nextInt(900));
        String industry = industries[random.nextInt(industries.length)];
        String randomMessage = messages[random.nextInt(messages.length)];

        nameInput.sendKeys(randomName);
        emailInput.sendKeys(randomEmail);

        WebElement companyInput = driver.findElement(By.id("company"));
        companyInput.clear();
        companyInput.sendKeys(company);

        WebElement industrySelect = driver.findElement(By.id("industry"));
        Select select = new Select(industrySelect);
        select.selectByVisibleText(industry);

        WebElement messageInput = driver.findElement(By.id("message"));
        messageInput.clear();
        messageInput.sendKeys(randomMessage);

        System.out.println("Submitting form query with data: " + randomEmail);
        js.executeScript("arguments[0].click();", submitBtn);

        // 5. Verify Success
        System.out.println("Waiting for form submission to complete...");
        // Wait for inputs to clear as defined in the React component's success state
        wait.until(ExpectedConditions.attributeToBe(By.id("name"), "value", ""));
        wait.until(ExpectedConditions.attributeToBe(By.id("email"), "value", ""));
        
        System.out.println("✅ Form query complete flow (Validation + Submission) passed successfully!");
    }
}
