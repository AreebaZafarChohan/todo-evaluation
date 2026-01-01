# backend-export-import
## Description
Guidelines for implementing data export (CSV, JSON, Excel) and bulk import functionality in backend systems.

## Core Principles
1. **Asynchronous Processing**: Use background tasks for large datasets.
2. **Validation**: Validate all imported data before persistence.
3. **Streaming**: Use streaming responses for large exports to save memory.
