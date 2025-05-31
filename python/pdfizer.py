from pypdf import PdfWriter, PdfReader
from typing import List
import sys

def concat_pdfs(pdfs: List[str], output_file: str):
    writer = PdfWriter()
    
    for pdf_file in pdfs:
        reader = PdfReader(pdf_file)
        writer.append_pages_from_reader(reader)
        
    with open(output_file, "wb") as file_pointer:
        writer.write(file_pointer)