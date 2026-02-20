
package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InvalidLoginTest extends BaseTest {

    @Test
    public void invalidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        try {
            loginPage.doLogin("invalid_username", "invalid_password");
            Assert.assertTrue(loginPage.getErrorMessage().contains("Please check your username and password"), "Error message is not as expected");
        } catch (Exception e) {
            Assert.fail("Invalid login test failed", e);
        }
    }
}
