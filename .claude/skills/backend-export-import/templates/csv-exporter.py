import csv
import io
from fastapi.responses import StreamingResponse

def generate_csv(data_generator):
    output = io.StringIO()
    writer = csv.writer(output)
    for row in data_generator:
        writer.writerow(row)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

# Implementation tip: Return StreamingResponse(generate_csv(rows), media_type="text/csv")
