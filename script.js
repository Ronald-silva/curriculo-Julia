// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadPDF');
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            // Desabilita o botão durante a geração do PDF
            downloadButton.disabled = true;
            downloadButton.textContent = 'Gerando PDF...';
            
            const { jsPDF } = window.jspdf;
            const element = document.querySelector('.container');
            
            // Configurações otimizadas para html2canvas
            html2canvas(element, {
                scale: 2, // Qualidade alta
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight
            }).then(function(canvas) {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Dimensões da página A4 em mm
                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 10;
                const contentWidth = pageWidth - (margin * 2);
                const contentHeight = pageHeight - (margin * 2);
                
                // Calcula as dimensões da imagem mantendo proporção
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = imgWidth / imgHeight;
                
                // Calcula altura e largura para caber na página mantendo proporção
                let pdfImgWidth = contentWidth;
                let pdfImgHeight = contentWidth / ratio;
                
                // Se a altura for maior que o conteúdo da página, ajusta
                if (pdfImgHeight > contentHeight) {
                    pdfImgHeight = contentHeight;
                    pdfImgWidth = contentHeight * ratio;
                }
                
                // Calcula quantas páginas serão necessárias
                const totalHeight = pdfImgHeight;
                
                // Se o conteúdo cabe em uma página
                if (totalHeight <= contentHeight) {
                    pdf.addImage(imgData, 'PNG', margin, margin, pdfImgWidth, pdfImgHeight);
                } else {
                    // Divide em múltiplas páginas usando posicionamento negativo
                    let heightLeft = totalHeight;
                    let position = margin;
                    
                    // Primeira página
                    pdf.addImage(imgData, 'PNG', margin, position, pdfImgWidth, pdfImgHeight);
                    heightLeft -= contentHeight;
                    
                    // Páginas adicionais
                    while (heightLeft > 0) {
                        position = margin - (totalHeight - heightLeft);
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', margin, position, pdfImgWidth, pdfImgHeight);
                        heightLeft -= contentHeight;
                    }
                }
                
                // Salva o PDF
                pdf.save('curriculo-ingrid-julia.pdf');
                
                // Reabilita o botão
                downloadButton.disabled = false;
                downloadButton.textContent = 'Baixar Currículo em PDF';
            }).catch(function(error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar o PDF. Por favor, tente novamente.');
                downloadButton.disabled = false;
                downloadButton.textContent = 'Baixar Currículo em PDF';
            });
        });
    }
});