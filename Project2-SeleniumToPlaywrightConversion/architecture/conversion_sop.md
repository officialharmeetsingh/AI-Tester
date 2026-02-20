# Conversion SOP - Selenium Java to Playwright TS

## Overview
This SOP defines the deterministic process for converting Selenium Java (TestNG) code into Playwright TypeScript.

## Conversion Process
1. **Extraction**: Identify imports, class structure, and test methods.
2. **Setup/Teardown Mapping**:
   - `@BeforeMethod` -> `test.beforeEach`
   - `@AfterMethod` -> `test.afterEach`
   - `@Test` -> `test('...', async ({ page }) => { ... })`
3. **Selector Conversion**:
   - `By.id("id")` -> `"#id"`
   - `By.cssSelector(".class")` -> `".class"`
   - `By.xpath("//...")` -> `"xpath=//..."`
4. **Action Mapping**:
   - `driver.get(url)` -> `await page.goto(url)`
   - `element.sendKeys(text)` -> `await page.fill(selector, text)`
   - `element.click()` -> `await page.click(selector)`
5. **Assertion Mapping**:
   - `Assert.assertEquals(actual, expected)` -> `expect(actual).toBe(expected)`
   - `Assert.assertTrue(element.isDisplayed())` -> `await expect(page.locator(selector)).toBeVisible()`

## LLM Interaction Strategy
- Use `codellama` via Ollama.
- Prompt must strictly request valid TypeScript.
- Provide few-shot examples of complex Java-to-TS mappings.

## Output Structure
- Converted scripts saved to `CONVERSION_OUTPUT_DIR`.
- Maintain original class name as filename (e.g., `LoginTest.java` -> `LoginTest.spec.ts`).
