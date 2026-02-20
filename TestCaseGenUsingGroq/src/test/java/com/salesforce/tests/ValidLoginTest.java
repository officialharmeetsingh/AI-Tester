
package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValidLoginTest extends BaseTest {

    @Test
    public void validLogin() {
        LoginPage loginPage = new LoginPage(driver);
        try {
            loginPage.doLogin("your_username", "your_password");
            Assert.assertNotEquals(driver.getTitle(), "Login | Salesforce", "Login was not successful");
        } catch (Exception e) {
            Assert.fail("Valid login test failed", e);
        }
    }
}
