import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "codellama")

class CodeConverter:
    def __init__(self):
        self.url = f"{OLLAMA_BASE_URL}/api/generate"
        self.model = OLLAMA_MODEL

    def convert_selenium_to_playwright(self, java_code):
        prompt = f"""
        System: You are an expert Test Automation Engineer specializing in Selenium Java and Playwright TypeScript.
        Task: Convert the following Selenium Java (TestNG) code into Playwright TypeScript.
        
        Rules:
        1. Use '@playwright/test'.
        2. Use async/await.
        3. Convert TestNG annotations (@Test, @BeforeMethod, @AfterMethod) to Playwright test hooks.
        4. Use web-first locators (page.locator, getByRole, etc.) where appropriate.
        5. Ensure the final output is ONLY the TypeScript code. No explanations.

        Java Code:
        {java_code}
        
        TypeScript Output:
        """
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        
        try:
            response = requests.post(self.url, json=payload)
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                return f"Error: API returned status code {response.status_code}"
        except Exception as e:
            return f"Error: {str(e)}"

if __name__ == "__main__":
    # Test with a simple snippet
    sample_java = """
    @Test
    public void loginTest() {
        driver.get("https://example.com");
        driver.findElement(By.id("username")).sendKeys("user");
        driver.findElement(By.id("password")).sendKeys("pass");
        driver.findElement(By.id("submit")).click();
        Assert.assertEquals(driver.getTitle(), "Dashboard");
    }
    """
    converter = CodeConverter()
    print("Converting sample code...")
    converted = converter.convert_selenium_to_playwright(sample_java)
    print("Converted Code:\n")
    print(converted)
