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
            
            // Usa html2canvas para capturar a imagem e depois converte para PDF
            html2canvas(element, {
                scale: 2, // Melhora a qualidade da imagem
                useCORS: true, // Permite carregar imagens externas
                logging: false
            }).then(function(canvas) {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // Largura A4 em mm
                const pageHeight = 295; // Altura A4 em mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                // Adiciona a primeira página
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Adiciona páginas adicionais se necessário
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
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