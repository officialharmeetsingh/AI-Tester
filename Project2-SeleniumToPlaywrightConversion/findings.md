# Findings - Selenium to Playwright Converter

## Research & Discoveries
- **Target Framework:** TestNG (Java) to Playwright (JS/TS).
- **Interface:** Web/Local UI for code input.
- **Output:** New directory for converted files + UI display.
- **Requirement:** "Convert Everything" implies handling assertions, waits, and POM structures.

### Conversion Mapping Table
| Concept | Selenium Java (TestNG) | Playwright (JS/TS) |
| :--- | :--- | :--- |
| Test Method | `@Test` | `test('name', async ({ page }) => { ... })` |
| Setup | `@BeforeMethod` | `test.beforeEach(async ({ page }) => { ... })` |
| Teardown | `@AfterMethod` | `test.afterEach(async ({ page }) => { ... })` |
| Navigation | `driver.get(url)` | `await page.goto(url)` |
| Locators | `By.id("foo")` | `page.locator("#foo")` or `page.getByRole(...)` |
| Actions | `element.sendKeys("val")` | `await page.fill("selector", "val")` |
| Assertions | `Assert.assertEquals(a, b)` | `expect(a).toBe(b)` |

## Constraints
- Conversion must handle Java syntax and mapping to Playwright TS/JS APIs.
- Must preserve TestNG logic (dependencies, data providers if any).
- LLM will be used to navigate the conversion logic for complex Java patterns.

## Implementation Details
- TBD
