package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class RegisterTest extends BaseTest {

    @Test
    public void testSuccessfulRegistrationFlow() throws InterruptedException {
        driver.get(BASE_URL + "/register");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        // Step 1: Basic Information
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("firstName"))).sendKeys("Test");
        driver.findElement(By.name("lastName")).sendKeys("User");
        String uniqueEmail = "testuser" + System.currentTimeMillis() + "@gmail.com";
        driver.findElement(By.name("email")).sendKeys(uniqueEmail);
        driver.findElement(By.name("password")).sendKeys("Hello*123");
        driver.findElement(By.name("confirmPassword")).sendKeys("Hello*123");

        Thread.sleep(1000); // Wait for React state to process

        // Click next
        WebElement continueBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[span[text()='Continue']]")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", continueBtn);

        // Step 2: Company Information
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("companyName"))).sendKeys("TestCompany");
        driver.findElement(By.name("jobTitle")).sendKeys("QA Engineer");
        
        Select companySizeSelect = new Select(driver.findElement(By.name("companySize")));
        companySizeSelect.selectByVisibleText("11-50 employees");
        
        Select industrySelect = new Select(driver.findElement(By.name("industry")));
        industrySelect.selectByVisibleText("Technology");
        
        driver.findElement(By.name("website")).sendKeys("https://testcompany.com");

        Thread.sleep(1000); // Wait for React state to process

        // Click next
        WebElement continueBtn2 = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[span[text()='Continue']]")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", continueBtn2);

        // Step 3: Marketing Preferences
        WebElement agreeTermsLabel = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@name='agreeToTerms']/ancestor::label")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", agreeTermsLabel);
        
        Thread.sleep(1000); // Wait for React state to process

        // Click Submit
        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[span[text()='Create Account']]")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitBtn);

        // Wait strictly for redirect to login page and ensure it works completely
        wait.until(ExpectedConditions.urlContains("/login"));
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete' ? true : null;"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "User should be redirected to login page on success");
    }
}