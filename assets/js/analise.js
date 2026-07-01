/**
 * analise.js — Script de recomendação de produtos Herbalife
 * 
 * Funcionalidades:
 *  - Carregamento de dados via JSON (fetch) com fallback hardcoded
 *  - Lógica de recomendação baseada em objetivo e atividade
 *  - Cálculo de custo por porção e investimento mensal
 *  - Geração de PDF com jsPDF
 *  - Validação de consentimento LGPD e idade mínima (18+)
 *  - Logs de debug (console.log com timestamp)
 *  - Tratamento de erros com mensagens amigáveis
 *  - Suporte a caminhos relativos (../../tabelas/)
 * 
 * Dependências externas (devem estar carregadas antes deste script):
 *   - jsPDF (biblioteca para geração de PDF)
 */

(function() {
    'use strict';

    /* -------------------------------------------------------
     * 1. CONFIGURAÇÃO DE CAMINHOS E FALLBACK
     * ------------------------------------------------------- */
    const JSON_PATH = '../../tabelas/tabelahlfpremium2026-dados.json';

    /* Dados hardcoded para fallback (estrutura esperada do JSON) */
    const FALLBACK_DATA = [
        { objetivo: 'emagrecimento', atividade: 'leve',    nome: 'Shake Herbalife F1',                preco: 129.90, pontos: 30, porcoesDia: 2 },
        { objetivo: 'emagrecimento', atividade: 'moderada', nome: 'Shake Herbalife F1',                preco: 129.90, pontos: 30, porcoesDia: 2 },
        { objetivo: 'emagrecimento', atividade: 'intensa',  nome: 'Shake Herbalife F1',                preco: 129.90, pontos: 30, porcoesDia: 2 },
        { objetivo: 'energia',        atividade: 'leve',    nome: 'Hype Drink',                        preco: 89.90,  pontos: 20, porcoesDia: 1 },
        { objetivo: 'energia',        atividade: 'moderada', nome: 'Hype Drink',                        preco: 89.90,  pontos: 20, porcoesDia: 2 },
        { objetivo: 'energia',        atividade: 'intensa',  nome: 'Hype Drink + Pré-treino',           preco: 149.80, pontos: 30, porcoesDia: 2 },
        { objetivo: 'performance',    atividade: 'intensa',  nome: 'Protocolo 21 Dias',                 preco: 299.00, pontos: 60, porcoesDia: 3 },
        { objetivo: 'performance',    atividade: 'moderada', nome: 'Shake F1 + Proteína',               preco: 199.00, pontos: 40, porcoesDia: 2 },
        { objetivo: 'imunidade',      atividade: 'leve',    nome: 'Imunidade + Multivitamínico',       preco: 109.00, pontos: 30, porcoesDia: 1 },
        { objetivo: 'imunidade',      atividade: 'moderada', nome: 'Imunidade + Multivitamínico',       preco: 109.00, pontos: 30, porcoesDia: 2 },
        { objetivo: 'imunidade',      atividade: 'intensa',  nome: 'Imunidade + Multivitamínico',       preco: 109.00, pontos: 30, porcoesDia: 3 }
    ];

    /* -------------------------------------------------------
     * 2. FUNÇÕES AUXILIARES
     * ------------------------------------------------------- */

    /**
     * Exibe mensagem de debug com timestamp (útil para testes no GitHub Pages).
     * @param {string} msg - A mensagem a ser logada.
     */
    function logDebug(msg) {
        const now = new Date();
        const timestamp = now.toISOString();
        console.log(`[${timestamp}] analise.js: ${msg}`);
    }

    /**
     * Exibe uma mensagem de erro amigável para o usuário na interface.
     * @param {string} message - Texto da mensagem.
     * @param {string} [elementId='msgErro'] - ID do elemento HTML onde a mensagem será inserida.
     */
    function showError(message, elementId = 'msgErro') {
        const erroDiv = document.getElementById(elementId);
        if (erroDiv) {
            erroDiv.textContent = message;
            erroDiv.style.display = 'block';
            erroDiv.style.color = '#d32f2f';
            erroDiv.style.fontWeight = 'bold';
        }
        alert(message); // fallback simples
    }

    /**
     * Limpa as mensagens de erro exibidas.
     * @param {string} [elementId='msgErro'] - ID do elemento HTML.
     */
    function clearError(elementId = 'msgErro') {
        const erroDiv = document.getElementById(elementId);
        if (erroDiv) {
            erroDiv.textContent = '';
            erroDiv.style.display = 'none';
        }
    }

    /* -------------------------------------------------------
     * 3. CARREGAMENTO DE DADOS
     * ------------------------------------------------------- */

    /**
     * Carrega os dados do arquivo JSON via fetch.
     * Em caso de falha (rede, arquivo não encontrado, etc.), utiliza dados hardcoded.
     * @returns {Promise<Array>} Array de objetos de produto.
     */
    async function loadData() {
        logDebug('Iniciando carregamento de dados...');
        try {
            const response = await fetch(JSON_PATH);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            logDebug('Dados carregados com sucesso via fetch.');
            return data;
        } catch (error) {
            logDebug(`Falha ao carregar JSON: ${error.message}. Usando fallback.`);
            console.warn('Detalhes do erro:', error);
            return FALLBACK_DATA;
        }
    }

    /* -------------------------------------------------------
     * 4. LÓGICA DE RECOMENDAÇÃO
     * ------------------------------------------------------- */

    /**
     * Filtra os produtos recomendados para o objetivo e nível de atividade fornecidos.
     * @param {Array} products - Array completo de produtos.
     * @param {string} objetivo - Objetivo do usuário (ex: 'emagrecimento', 'energia', etc.).
     * @param {string} atividade - Nível de atividade (ex: 'leve', 'moderada', 'intensa').
     * @returns {Array} Produtos que atendem aos critérios.
     */
    function recommendProducts(products, objetivo, atividade) {
        logDebug(`Recomendando para objetivo: ${objetivo}, atividade: ${atividade}`);
        const recomendados = products.filter(produto =>
            produto.objetivo.toLowerCase() === objetivo.toLowerCase() &&
            produto.atividade.toLowerCase() === atividade.toLowerCase()
        );
        logDebug(`${recomendados.length} produto(s) recomendado(s).`);
        return recomendados;
    }

    /* -------------------------------------------------------
     * 5. CÁLCULOS FINANCEIROS
     * ------------------------------------------------------- */

    /**
     * Calcula o custo por porção de um produto.
     * @param {number} preco - Preço do produto.
     * @param {number} pontos - Quantidade de porções (pontos).
     * @returns {number} Custo por porção.
     */
    function costPerServing(preco, pontos) {
        return preco / pontos;
    }

    /**
     * Para uma lista de produtos recomendados, calcula o custo diário total e o investimento mensal.
     * @param {Array} recommended - Produtos recomendados (cada um deve ter preco, pontos, porcoesDia).
     * @returns {{custoDiario: number, investimentoMensal: number, detalhes: Array}}
     */
    function calculateInvestment(recommended) {
        let custoDiario = 0;
        const detalhes = recommended.map(produto => {
            const custoPorcao = costPerServing(produto.preco, produto.pontos);
            const custoDiarioProduto = custoPorcao * produto.porcoesDia;
            custoDiario += custoDiarioProduto;
            return {
                nome: produto.nome,
                porcoesDia: produto.porcoesDia,
                custoPorcao: custoPorcao,
                custoDiarioProduto: custoDiarioProduto
            };
        });
        const investimentoMensal = custoDiario * 30;
        logDebug(`Custo diário: R$ ${custoDiario.toFixed(2)}, Investimento mensal: R$ ${investimentoMensal.toFixed(2)}`);
        return { custoDiario, investimentoMensal, detalhes };
    }

    /* -------------------------------------------------------
     * 6. VALIDAÇÕES
     * ------------------------------------------------------- */

    /**
     * Valida a idade (deve ser >= 18).
     * @param {string|number} idade - Idade fornecida pelo usuário.
     * @returns {boolean} true se a idade é válida.
     */
    function validateAge(idade) {
        const idadeNum = parseInt(idade, 10);
        if (isNaN(idadeNum)) {
            showError('Por favor, insira uma idade válida.');
            return false;
        }
        if (idadeNum < 18) {
            showError('Você deve ter pelo menos 18 anos para utilizar este serviço.');
            return false;
        }
        return true;
    }

    /**
     * Valida o consentimento LGPD (checkbox marcado).
     * @param {boolean} consentido - Indicador se o checkbox está marcado.
     * @returns {boolean} true se o consentimento foi dado.
     */
    function validateConsent(consentido) {
        if (!consentido) {
            showError('É necessário consentir com a política de privacidade (LGPD) para prosseguir.');
            return false;
        }
        return true;
    }

    /* -------------------------------------------------------
     * 7. GERAÇÃO DE PDF
     * ------------------------------------------------------- */

    /**
     * Gera um PDF utilizando a biblioteca jsPDF.
     * O PDF contém: nome do usuário, objetivo, tabela de produtos recomendados,
     * custo diário, investimento mensal e próximos passos.
     * 
     * @param {string} nome - Nome do usuário.
     * @param {string} objetivo - Objetivo selecionado.
     * @param {Array} detalhes - Detalhes dos produtos (nome, porcoesDia, custoPorcao, custoDiarioProduto).
     * @param {number} custoDiario - Custo diário total.
     * @param {number} investimentoMensal - Investimento mensal estimado.
     */
    function generatePDF(nome, objetivo, detalhes, custoDiario, investimentoMensal) {
        logDebug('Gerando PDF...');

        // Verifica se a biblioteca jsPDF está disponível
        if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            showError('Erro: a biblioteca jsPDF não foi carregada. Verifique a inclusão do script no HTML.');
            return;
        }

        try {
            const { jsPDF } = window.jspdf || { jsPDF: jsPDF }; // compatibilidade com importação ESM
            const doc = new jsPDF();

            // Configurações iniciais
            const pageWidth = doc.internal.pageSize.getWidth();
            let posY = 20;
            const margin = 15;

            // Título
            doc.setFontSize(20);
            doc.setTextColor(34, 139, 34); // verde
            doc.text('Recomendação Herbalife - Edu Sidegum', margin, posY);
            posY += 10;

            // Informações do usuário
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Nome: ${nome}`, margin, posY += 10);
            doc.text(`Objetivo: ${objetivo}`, margin, posY += 8);
            posY += 5;

            // Linha separadora
            doc.setDrawColor(34, 139, 34);
            doc.line(margin, posY, pageWidth - margin, posY);
            posY += 6;

            // Tabela de produtos recomendados
            doc.setFontSize(14);
            doc.text('Produtos Recomendados', margin, posY);
            posY += 8;

            // Cabeçalho da tabela
            doc.setFontSize(10);
            doc.setTextColor(80);
            const col1 = margin;
            const col2 = col1 + 60;
            const col3 = col2 + 30;
            const col4 = col3 + 30;
            const colWidths = { 'Produto': 60, 'Porções/dia': 30, 'Custo/porção': 30, 'Custo diário': 30 };
            doc.text('Produto', col1, posY);
            doc.text('Porções/dia', col2, posY);
            doc.text('Custo/porção', col3, posY);
            doc.text('Custo diário', col4, posY);
            posY += 4;
            doc.line(margin, posY, pageWidth - margin, posY);
            posY += 4;

            // Linhas dos produtos
            doc.setFontSize(10);
            doc.setTextColor(0);
            detalhes.forEach(item => {
                doc.text(item.nome.substring(0, 25), col1, posY); // trunca para caber
                doc.text(item.porcoesDia.toString(), col2, posY);
                doc.text(`R$ ${item.custoPorcao.toFixed(2)}`, col3, posY);
                doc.text(`R$ ${item.custoDiarioProduto.toFixed(2)}`, col4, posY);
                posY += 7;
            });

            // Linha final da tabela
            doc.line(margin, posY, pageWidth - margin, posY);
            posY += 6;

            // Totais
            doc.setFontSize(12);
            doc.setTextColor(34, 139, 34);
            doc.text(`Custo diário total: R$ ${custoDiario.toFixed(2)}`, margin, posY);
            posY += 8;
            doc.text(`Investimento mensal estimado (30 dias): R$ ${investimentoMensal.toFixed(2)}`, margin, posY);
            posY += 12;

            // Próximos passos
            doc.setFontSize(13);
            doc.setTextColor(0);
            doc.text('Próximos Passos:', margin, posY);
            posY += 8;
            doc.setFontSize(10);
            const passos = [
                'Entre em contato pelo WhatsApp (51) 99966-3200 para personalizar seu protocolo.',
                'Agende uma consultoria gratuita em Novo Hamburgo/RS.',
                'Visite o catálogo oficial: catalogoherbalife.com.br/edusidegum',
                'Leia o Manual de Normas do Distribuidor Independente Herbalife.'
            ];
            passos.forEach(passo => {
                doc.text(`• ${passo}`, margin + 5, posY, { maxWidth: pageWidth - margin * 2 - 10 });
                posY += 7;
            });

            // Disclaimer obrigatório (texto fixo conforme documento)
            posY += 5;
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text('DISCLAIMER: Os resultados apresentados variam de pessoa para pessoa, dependendo de fatores como metabolismo, adesão ao protocolo e prática de atividades físicas. Os produtos Herbalife são suplementos alimentares e não medicamentos. Consulte um médico ou nutricionista antes de iniciar qualquer programa nutricional. Edu Sidegum — Distribuidor Independente Herbalife. Imagens meramente ilustrativas.',
                margin, posY, { maxWidth: pageWidth - margin * 2, align: 'justify' });

            // Rodapé
            posY += 20;
            doc.setFontSize(8);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} por analise.js`, margin, posY);

            // Salva o PDF
            doc.save(`recomendacao_${objetivo}_${nome.replace(/\s/g, '_')}.pdf`);
            logDebug('PDF gerado com sucesso.');
        } catch (error) {
            showError('Ocorreu um erro ao gerar o PDF. Tente novamente.');
            logDebug(`Erro na geração do PDF: ${error.message}`);
            console.error(error);
        }
    }

    /* -------------------------------------------------------
     * 8. INTEGRAÇÃO COM FORMULÁRIO HTML
     * ------------------------------------------------------- */

    /**
     * Manipulador do evento de envio do formulário.
     * Realiza validações, processa recomendação e gera o PDF.
     * @param {Event} event - Evento de submit do formulário.
     * @param {Array} products - Dados completos dos produtos (carregados).
     */
    function handleFormSubmit(event, products) {
        event.preventDefault();
        clearError();
        logDebug('Formulário enviado.');

        // Obter valores dos campos
        const nome = document.getElementById('nome')?.value.trim();
        const idade = document.getElementById('idade')?.value;
        const objetivo = document.getElementById('objetivo')?.value;
        const atividade = document.getElementById('atividade')?.value;
        const consentimento = document.getElementById('consentimento')?.checked;

        // Validações
        if (!nome || !idade || !objetivo || !atividade) {
            showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (!validateAge(idade)) return;
        if (!validateConsent(consentimento)) return;

        // Recomendação e cálculos
        try {
            const recomendados = recommendProducts(products, objetivo, atividade);
            if (recomendados.length === 0) {
                showError('Nenhum produto encontrado para a combinação selecionada. Tente outra combinação.');
                return;
            }
            const { custoDiario, investimentoMensal, detalhes } = calculateInvestment(recomendados);
            generatePDF(nome, objetivo, detalhes, custoDiario, investimentoMensal);
        } catch (error) {
            showError('Ocorreu um erro interno. Por favor, tente novamente.');
            logDebug(`Erro no processamento: ${error.message}`);
            console.error(error);
        }
    }

    /* -------------------------------------------------------
     * 9. INICIALIZAÇÃO
     * ------------------------------------------------------- */

    document.addEventListener('DOMContentLoaded', async function() {
        logDebug('Script iniciado. Aguardando interação...');

        // Carregar dados
        const products = await loadData();
        logDebug(`Total de produtos carregados: ${products.length}`);

        // Associar evento ao formulário (supondo que exista um form com id "formRecomendacao" e um botão de submit)
        const form = document.getElementById('formRecomendacao');
        if (form) {
            form.addEventListener('submit', function(event) {
                handleFormSubmit(event, products);
            });
            logDebug('Evento de submit associado ao formulário #formRecomendacao.');
        } else {
            logDebug('Formulário #formRecomendacao não encontrado. Nenhum evento associado.');
            console.warn('Certifique-se de que o HTML contém um formulário com id="formRecomendacao".');
        }

        // Também podemos adicionar um handler para um botão direto (caso não use <form>)
        const btnGerar = document.getElementById('btnGerarPDF');
        if (btnGerar && !form) {
            btnGerar.addEventListener('click', function(event) {
                // simula envio
                handleFormSubmit(event, products);
            });
        }
    });
})();
