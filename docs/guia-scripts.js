// Scripts Centralizados para Todos os Guias

// Copiar código
function copyCode(button) {
    const codeBlock = button.closest('.code-header').nextElementSibling;
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copiado!';
        button.style.background = 'rgba(39, 174, 96, 0.3)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        button.textContent = '❌ Erro';
        console.error('Erro ao copiar:', err);
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Highlight código ao passar mouse
document.querySelectorAll('pre').forEach(pre => {
    pre.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
    });
    pre.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Print button
if (!document.querySelector('.print-button')) {
    const printBtn = document.createElement('button');
    printBtn.className = 'print-button';
    printBtn.textContent = '🖨️ Imprimir';
    printBtn.onclick = () => window.print();
    printBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        z-index: 1000;
        transition: all 0.3s;
    `;
    printBtn.onmouseenter = function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.6)';
    };
    printBtn.onmouseleave = function() {
        this.style.transform = '';
        this.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.4)';
    };
    document.body.appendChild(printBtn);
}

// Indicador de progresso de leitura
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #3498db, #9b59b6);
    width: 0%;
    z-index: 9999;
    transition: width 0.2s;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
});

console.log('✅ Guia carregado com sucesso!');
