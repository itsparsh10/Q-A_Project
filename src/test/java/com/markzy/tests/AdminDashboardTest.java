package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.List;

public class AdminDashboardTest extends BaseTest {

    @Test
    public void testAdminStatisticsFlow() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;

        // 1. Login as Admin
        driver.get(BASE_URL + "/login");
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete'"));
        Thread.sleep(1000);

        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
        emailField.clear();
        emailField.sendKeys("admin@gmail.com");
        
        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.clear();
        passwordField.sendKeys("Hello*123");
        
        WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@type='submit']")));
        js.executeScript("arguments[0].click();", loginBtn);

        // 2. Wait for redirect to Admin Dashboard
        System.out.println("Waiting for redirect to Admin Dashboard...");
        wait.until(ExpectedConditions.urlContains("/admin_dashboard"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Admin Dashboard')]")));

        // 3. Verify Global Statistics Cards are present and have data
        System.out.println("Verifying global statistics cards...");
        
        // Wait for stats to load (spinner should disappear or stats should appear)
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div[p[contains(text(), 'Total Users')]]")));

        // Define expected statistic headers
        String[] expectedStats = {"Total Users", "Active Users", "Tool Usage", "Total Payments"};
        
        for (String statTitle : expectedStats) {
            WebElement statCard = driver.findElement(By.xpath("//div[p[contains(text(), '" + statTitle + "')]]"));
            // The value is in the next p element or a bold text within the card
            WebElement statValue = statCard.findElement(By.xpath(".//p[contains(@class, 'font-bold')] | .//p[not(contains(text(), '" + statTitle + "'))]"));
            
            String value = statValue.getText();
            System.out.println("Stat: " + statTitle + " | Value: " + value);
            
            Assert.assertFalse(value.isEmpty(), statTitle + " value should not be empty");
        }

        // 4. Explore all Admin Dashboard Tabs
        System.out.println("Exploring all admin dashboard tabs...");
        
        String[] tabs = {
            "Overview", 
            "Users", 
            "User Analytics", 
            "Analytics", 
            "Revenue", 
            "Tools", 
            "Form Query", 
            "Support"
        };

        for (String tabName : tabs) {
            System.out.println("Clicking tab: " + tabName);
            WebElement tabBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., '" + tabName + "')]")
            ));
            
            js.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", tabBtn);
            Thread.sleep(500);
            js.executeScript("arguments[0].click();", tabBtn);
            
            // Verify content for each tab (waiting for specific headers or containers)
            wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//div[contains(@class, 'max-w-full')]")
            ));
            
            Thread.sleep(800); // Short pause to visualize the transition
            System.out.println("✅ Tab '" + tabName + "' explored successfully.");
        }

        System.out.println("✅ All admin dashboard tabs explored. Test complete.");
    }
}
