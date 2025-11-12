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
            
            // Salva estilos originais
            const originalMaxWidth = element.style.maxWidth;
            const originalWidth = element.style.width;
            
            // Ajusta temporariamente o container para usar mais largura no PDF
            element.style.maxWidth = '100%';
            element.style.width = '800px'; // Largura maior para melhor renderização no PDF
            
            // Aguarda um frame para o navegador renderizar as mudanças
            setTimeout(function() {
                // Configurações otimizadas para html2canvas com maior escala
                html2canvas(element, {
                scale: 3, // Aumenta a qualidade e tamanho do texto
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: element.scrollWidth
            }).then(function(canvas) {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Dimensões da página A4 em mm
                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 15; // Margens um pouco maiores
                const contentWidth = pageWidth - (margin * 2);
                const contentHeight = pageHeight - (margin * 2);
                
                // Calcula as dimensões da imagem mantendo proporção
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = imgWidth / imgHeight;
                
                // Calcula altura e largura para usar toda a largura disponível
                // Usa toda a largura do conteúdo disponível
                let pdfImgWidth = contentWidth;
                let pdfImgHeight = contentWidth / ratio;
                
                // Centraliza horizontalmente (sempre centralizado)
                const xPosition = margin;
                
                // Calcula quantas páginas serão necessárias
                const totalHeight = pdfImgHeight;
                
                // Se o conteúdo cabe em uma página
                if (totalHeight <= contentHeight) {
                    pdf.addImage(imgData, 'PNG', xPosition, margin, pdfImgWidth, pdfImgHeight);
                } else {
                    // Divide em múltiplas páginas usando posicionamento negativo
                    let heightLeft = totalHeight;
                    let position = margin;
                    
                    // Primeira página
                    pdf.addImage(imgData, 'PNG', xPosition, position, pdfImgWidth, pdfImgHeight);
                    heightLeft -= contentHeight;
                    
                    // Páginas adicionais
                    while (heightLeft > 0) {
                        position = margin - (totalHeight - heightLeft);
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', xPosition, position, pdfImgWidth, pdfImgHeight);
                        heightLeft -= contentHeight;
                    }
                }
                
                // Salva o PDF
                pdf.save('curriculo-ingrid-julia.pdf');
                
                // Restaura estilos originais
                element.style.maxWidth = originalMaxWidth;
                element.style.width = originalWidth;
                
                // Reabilita o botão
                downloadButton.disabled = false;
                downloadButton.textContent = 'Baixar Currículo em PDF';
            }).catch(function(error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar o PDF. Por favor, tente novamente.');
                
                // Restaura estilos originais mesmo em caso de erro
                element.style.maxWidth = originalMaxWidth;
                element.style.width = originalWidth;
                
                downloadButton.disabled = false;
                downloadButton.textContent = 'Baixar Currículo em PDF';
            });
            }, 100); // Pequeno delay para renderização
        });
    }
});