#!/usr/bin/env python3
"""
Converte HTML para PDF usando markdown e pdfkit/wkhtmltopdf
"""

import subprocess
import sys
import os

def check_wkhtmltopdf():
    """Verifica se wkhtmltopdf está instalado"""
    try:
        subprocess.run(['wkhtmltopdf', '--version'],
                      capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def html_to_pdf_wkhtmltopdf(html_file, pdf_file):
    """Converte HTML para PDF usando wkhtmltopdf"""
    cmd = [
        'wkhtmltopdf',
        '--enable-local-file-access',
        '--print-media-type',
        '--no-stop-slow-scripts',
        '--javascript-delay', '1000',
        '--margin-top', '20mm',
        '--margin-bottom', '20mm',
        '--margin-left', '20mm',
        '--margin-right', '20mm',
        '--footer-center', '[page]/[topage]',
        '--footer-font-size', '9',
        html_file,
        pdf_file
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Erro ao converter: {e.stderr}")
        return False

def main():
    html_file = 'docs/planejamento-bi-ia.html'
    pdf_file = 'docs/planejamento-bi-ia.pdf'

    if not os.path.exists(html_file):
        print(f"Arquivo {html_file} não encontrado!")
        sys.exit(1)

    if check_wkhtmltopdf():
        print("Convertendo HTML para PDF usando wkhtmltopdf...")
        if html_to_pdf_wkhtmltopdf(html_file, pdf_file):
            print(f"✅ PDF criado com sucesso: {pdf_file}")
            sys.exit(0)
        else:
            print("❌ Falha na conversão")
            sys.exit(1)
    else:
        print("❌ wkhtmltopdf não encontrado")
        print("💡 Você pode abrir o arquivo HTML no navegador e usar 'Imprimir > Salvar como PDF'")
        print(f"📄 Arquivo HTML: {os.path.abspath(html_file)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
