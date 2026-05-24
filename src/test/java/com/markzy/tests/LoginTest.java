package com.markzy.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class LoginTest extends BaseTest {

    @Test
    public void testSuccessfulLogin() {
        driver.get(BASE_URL + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("email"))).sendKeys("hello@gmail.com");
        driver.findElement(By.name("password")).sendKeys("Hello*123");
        
        driver.findElement(By.xpath("//button[@type='submit']")).click();

        // Wait strictly for redirect to /dashboard page and ensure the page loads completely
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        wait.until(ExpectedConditions.jsReturnsValue("return document.readyState == 'complete' ? true : null;"));
        
        // Optionally wait for a specific element on the dashboard page to ensure it's rendered
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[contains(text(), 'Dashboard')]")));
        
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"), "User should be redirected to /dashboard page after login");
    }
}
