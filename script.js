(function(){
    // Aguarda o carregamento completo do DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const btn = document.getElementById('downloadPDF');
        const container = document.getElementById('curriculo');

        if (!btn || !container) {
            console.error('Elementos necessários não encontrados');
            return;
        }

        btn.addEventListener('click', gerarPDF);
    }

    // Helper: ajusta escala para saída de boa qualidade
    async function gerarPDF() {
        const btn = document.getElementById('downloadPDF');
        const container = document.getElementById('curriculo');
        try {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Gerando PDF...';

            // Garantir que o layout esteja renderizado antes de capturar
            await new Promise(resolve => setTimeout(resolve, 100));

            // Forçar layout fixo para melhor renderização
            const header = container.querySelector('.header');
            const foto = container.querySelector('.foto-perfil');
            const nome = container.querySelector('.nome');
            
            if (header) {
                header.style.display = 'flex';
                header.style.alignItems = 'center';
                header.style.gap = '20px';
            }
            
            if (foto) {
                foto.style.width = '120px';
                foto.style.height = '120px';
                foto.style.maxWidth = '120px';
                foto.style.maxHeight = '120px';
            }
            
            if (nome) {
                nome.style.fontSize = '2.1rem';
                nome.style.lineHeight = '1.2';
            }

            // Aguardar renderização
            await new Promise(resolve => setTimeout(resolve, 200));

            // aumenta escala para melhor resolução no PDF
            const scale = 3; 
            const opts = {
                scale: scale,
                useCORS: true,
                allowTaint: false,
                logging: false,
                letterRendering: true,
                backgroundColor: '#ffffff',
                windowWidth: container.scrollWidth,
                windowHeight: container.scrollHeight,
                width: container.scrollWidth,
                height: container.scrollHeight,
            };

            // html2canvas captura
            const canvas = await html2canvas(container, opts);

            // calcula dimensões para jsPDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            const { jsPDF } = window.jspdf;

            // A4 portrait dimensões em mm
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // largura/altura do pdf em px compatível com canvas
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // largura/altura da imagem em mm
            const imgProps = { width: canvas.width, height: canvas.height };
            const pxToMm = (px) => (px * 0.264583); // 1px => 0.264583 mm (aprox)

            const imgWidthMm = pxToMm(imgProps.width);
            const imgHeightMm = pxToMm(imgProps.height);

            // escala para caber na página mantendo proporção
            const ratio = Math.min(pageWidth / imgWidthMm, pageHeight / imgHeightMm);

            const renderWidth = imgWidthMm * ratio;
            const renderHeight = imgHeightMm * ratio;

            // se a imagem for maior que uma página, quebrar em páginas
            let position = 0;
            let remainingHeightPx = imgProps.height;
            const pageHeightPx = (pageHeight / pxToMm(1)); // em px

            // Render por páginas: vamos desenhar fatias verticais da imagem
            // Simples técnica: desenhar imagem inteira em escala se couber, caso contrário fatiar
            if (renderHeight <= pageHeight) {
                pdf.addImage(imgData, 'PNG', (pageWidth - renderWidth)/2, (pageHeight - renderHeight)/2, renderWidth, renderHeight, undefined, 'FAST');
            } else {
                // Fatiamento
                // Criar canvas temporário para cada slice em px
                const sliceHeightPx = Math.floor((pageHeight / ratio) / (0.264583)); // converter mm->px
                let yOffset = 0;
                while (remainingHeightPx > 0) {
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = canvas.width;
                    const curSlicePx = Math.min(sliceHeightPx, remainingHeightPx);
                    sliceCanvas.height = curSlicePx;
                    const ctx = sliceCanvas.getContext('2d');

                    // desenha a fatia do canvas principal
                    ctx.drawImage(canvas, 0, yOffset, canvas.width, curSlicePx, 0, 0, canvas.width, curSlicePx);

                    const sliceData = sliceCanvas.toDataURL('image/png', 1.0);
                    const sliceHeightMm = pxToMm(curSlicePx) * ratio;
                    const sliceWidthMm = renderWidth;

                    if (yOffset > 0) pdf.addPage();

                    pdf.addImage(sliceData, 'PNG', (pageWidth - sliceWidthMm)/2, 10, sliceWidthMm, sliceHeightMm, undefined, 'FAST');

                    yOffset += curSlicePx;
                    remainingHeightPx -= curSlicePx;
                }
            }

            // Nome do arquivo
            const fileName = 'Curriculo_Ingrid_Julia.pdf';
            pdf.save(fileName);

            // Restaurar estilos originais
            if (header) {
                header.style.display = '';
                header.style.alignItems = '';
                header.style.gap = '';
            }
            if (foto) {
                foto.style.width = '';
                foto.style.height = '';
                foto.style.maxWidth = '';
                foto.style.maxHeight = '';
            }
            if (nome) {
                nome.style.fontSize = '';
                nome.style.lineHeight = '';
            }

            btn.textContent = 'PDF gerado ✔';
            setTimeout(()=> btn.textContent = originalText, 1800);
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar o PDF. Tente novamente ou abra em outro navegador.');
            btn.textContent = 'Baixar Currículo em PDF';
            
            // Restaurar estilos em caso de erro
            const container = document.getElementById('curriculo');
            const header = container?.querySelector('.header');
            const foto = container?.querySelector('.foto-perfil');
            const nome = container?.querySelector('.nome');
            
            if (header) {
                header.style.display = '';
                header.style.alignItems = '';
                header.style.gap = '';
            }
            if (foto) {
                foto.style.width = '';
                foto.style.height = '';
                foto.style.maxWidth = '';
                foto.style.maxHeight = '';
            }
            if (nome) {
                nome.style.fontSize = '';
                nome.style.lineHeight = '';
            }
        } finally {
            btn.disabled = false;
        }
    }
})();