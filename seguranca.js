// Início do Código de Segurança

// Domínio permitido. Apenas o Hotmart Club pode abrir este jogo.
const dominioPermitido = "hotmart.com";

// Verifica quem está tentando abrir
const veioDeOnde = document.referrer;

// Checagem
if (veioDeOnde && veioDeOnde.includes(dominioPermitido)) {
    // Veio do Hotmart. Tudo certo.
    console.log("Acesso permitido via Hotmart.");
} else {
    // Não veio do Hotmart (provavelmente link direto)
    // Bloqueia a página inteira.
    console.log("Acesso direto negado.");
    document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px; color: #333;">
            <h1>Acesso Negado</h1>
            <p>Este recurso interativo é exclusivo para membros.</p>
            <p>Para ter acesso, adquira o kit em nossa página oficial.</p>
        </div>
    `;
}
// Fim do Código de Segurança