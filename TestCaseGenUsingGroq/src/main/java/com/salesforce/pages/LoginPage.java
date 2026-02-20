
package com.salesforce.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//input[@id='username']")
    private WebElement username;

    @FindBy(xpath = "//input[@id='password']")
    private WebElement password;

    @FindBy(xpath = "//input[@id='Login']")
    private WebElement loginButton;
    
    @FindBy(xpath = "//div[@id='error']")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String user) {
        try {
            wait.until(ExpectedConditions.visibilityOf(username)).sendKeys(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enter username", e);
        }
    }

    public void enterPassword(String pass) {
        try {
            wait.until(ExpectedConditions.visibilityOf(password)).sendKeys(pass);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enter password", e);
        }
    }

    public void clickLoginButton() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        } catch (Exception e) {
            throw new RuntimeException("Failed to click login button", e);
        }
    }
    
    public String getErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get error message", e);
        }
    }

    public void doLogin(String user, String pass) {
        enterUsername(user);
        enterPassword(pass);
        clickLoginButton();
    }
}
