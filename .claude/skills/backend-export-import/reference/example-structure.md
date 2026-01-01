# Export/Import Module Structure Reference

```
src/
  export/
    csv-exporter.ts       # CSV export functionality
    json-exporter.ts      # JSON export functionality
    excel-exporter.ts     # Excel export functionality
    export-queue.ts       # Background job queue
    export-history.ts     # Track export history
  import/
    csv-importer.ts       # CSV import functionality
    json-importer.ts      # JSON import functionality
    import-queue.ts       # Background job queue
    import-errors.ts      # Track and report import errors
  parsers/
    csv-parser.ts         # CSV parsing logic
    json-parser.ts        # JSON parsing logic
  validators/
    import-validator.ts   # Validate import data
```

## Export Workflow

```
User Request
    ↓
Validate Export Permissions
    ↓
Generate Export (sync/async)
    ↓
Return Download URL / Notify User
```

## Import Workflow

```
User Upload
    ↓
Validate File Format
    ↓
Parse and Validate Data
    ↓
Preview Changes (optional)
    ↓
Confirm Import
    ↓
Process Import (async)
    ↓
Report Results
```

## Supported Formats

- **CSV**: Comma-separated values with header row
- **JSON**: Array of objects
- **Excel**: .xlsx format with multiple sheets

## Error Handling

- Invalid file format → 400 Bad Request
- Data validation errors → Return with line numbers
- Large imports → Use background queue
