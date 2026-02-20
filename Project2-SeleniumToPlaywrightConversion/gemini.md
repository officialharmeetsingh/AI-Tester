# Gemini - Project Constitution

## Data Schemas
### Input (Selenium Java)
```json
{
  "source_code": "string",
  "framework": "TestNG",
  "target_language": "TypeScript"
}
```

### Output (Playwright JS/TS)
```json
{
  "converted_code": "string",
  "status": "success | error",
  "files": [
    {
      "filename": "string",
      "content": "string"
    }
  ]
}
```

## Behavioral Rules
- **North Star:** Complete conversion of TestNG Selenium Java to Playwright JS/TS.
- **Source of Truth:** UI Input (User provided code).
- **Delivery:** Converted code must be saved to a local directory and returned to the UI.
- **Scope:** "Convert Everything" - ensure full logic replication.
- Prioritize reliability over speed.
- Never guess at business logic.
- Follow A.N.T. 3-layer architecture.
- If logic changes, update the SOP before updating the code.

## Architectural Invariants
- Layer 1: Architecture (`architecture/`) - SOPs in Markdown.
- Layer 2: Navigation - Reasoning/Routing logic.
- Layer 3: Tools (`tools/`) - Deterministic scripts.

## Maintenance Log
- TBD
