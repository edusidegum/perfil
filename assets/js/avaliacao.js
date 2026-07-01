(function() {
    'use strict';

    // ============================================================
    // 1. CONSTANTES E CONFIGURAÇÕES
    // ============================================================
    const CONFIG = {
        imcDisclaimer: 'O IMC é um indicador de triagem e não substitui avaliação de composição corporal (bioimpedância) ou análise clínica especializada.',
        objetivos: {
            1: 'Redução de peso',
            2: 'Ganho de massa',
            3: 'Manutenção',
            4: 'Vida saudável',
            5: 'Rendimento esportivo'
        },
        classificacaoIMC: [
            { limite: 18.5, label: 'Abaixo do peso' },
            { limite: 24.9, label: 'Normal' },
            { limite: 29.9, label: 'Sobrepeso' },
            { limite: 34.9, label: 'Obesidade Grau I' },
            { limite: 39.9, label: 'Obesidade Grau II' },
            { limite: Infinity, label: 'Obesidade Grau III' }
        ]
    };

    // ============================================================
    // 2. DADOS DOS PRODUTOS (fallback interno)
    // ============================================================
    const produtos = [
        { id: 1, nome: 'Shake Formula 1 (Morango)', categoria: 'Shake', preco: 89.90, pontos: 25, porcoesDia: 2, objetivo: 1 },
        { id: 2, nome: 'Shake Formula 1 (Baunilha)', categoria: 'Shake', preco: 89.90, pontos: 25, porcoesDia: 2, objetivo: 1 },
        { id: 3, nome: 'Aloe Vera Concentrado', categoria: 'Bebida', preco: 72.50, pontos: 20, porcoesDia: 1, objetivo: 4 },
        { id: 4, nome: 'Hype Drink (Limão)', categoria: 'Energético', preco: 45.00, pontos: 15, porcoesDia: 1, objetivo: 5 },
        { id: 5, nome: 'Proteína Isolada de Soja', categoria: 'Proteína', preco: 120.00, pontos: 30, porcoesDia: 2, objetivo: 2 },
        { id: 6, nome: 'Barra de Proteína (Chocolate)', categoria: 'Snack', preco: 18.50, pontos: 5, porcoesDia: 1, objetivo: 2 },
        { id: 7, nome: 'Multivitamínico Herbalife', categoria: 'Suplemento', preco: 95.00, pontos: 22, porcoesDia: 1, objetivo: 3 },
        { id: 8, nome: 'Fibra de Maçã', categoria: 'Fibra', preco: 65.00, pontos: 18, porcoesDia: 1, objetivo: 4 },
        { id: 9, nome: 'Chá Termogênico (Limão)', categoria: 'Chá', preco: 52.00, pontos: 14, porcoesDia: 2, objetivo: 1 },
        { id: 10, nome: 'Creatina Herbalife', categoria: 'Desempenho', preco: 110.00, pontos: 28, porcoesDia: 1, objetivo: 5 },
        { id: 11, nome: 'Óleo de Peixe Ômega-3', categoria: 'Suplemento', preco: 78.00, pontos: 20, porcoesDia: 1, objetivo: 3 },
        { id: 12, nome: 'Shake Formula 1 (Chocolate)', categoria: 'Shake', preco: 89.90, pontos: 25, porcoesDia: 2, objetivo: 1 },
        { id: 13, nome: 'Pro-Lessen (Recuperação Muscular)', categoria: 'Recuperação', preco: 135.00, pontos: 32, porcoesDia: 1, objetivo: 5 },
        { id: 14, nome: 'Snack de Proteína (Amendoim)', categoria: 'Snack', preco: 22.00, pontos: 6, porcoesDia: 1, objetivo: 2 }
    ];

    // ============================================================
    // 3. FUNÇÕES AUXILIARES
    // ============================================================
    function validarNumeroPositivo(valor, permitirZero = false) {
        const num = parseFloat(valor);
        if (isNaN(num)) return false;
        if (permitirZero) return num >= 0;
        return num > 0;
    }

    function calcularIMC(peso, altura) {
        if (!validarNumeroPositivo(peso) || !validarNumeroPositivo(altura)) return null;
        return peso / (altura * altura);
    }

    function classificarIMC(imc) {
        for (const item of CONFIG.classificacaoIMC) {
            if (imc <= item.limite) return item.label;
        }
        return 'Obesidade Grau III';
    }

    function calcularValorPorPorcao(preco, porcoesDia) {
        if (!porcoesDia || porcoesDia <= 0) return preco;
        return (preco / 30 / porcoesDia).toFixed(2); // preço por porção (mês de 30 dias)
    }

    // ============================================================
    // 4. MÓDULO IMC
    // ============================================================
    function moduloIMC() {
        const pesoInput = document.getElementById('imc-peso');
        const alturaInput = document.getElementById('imc-altura');
        const resultadoDiv = document.getElementById('imc-resultado');
        const tabelaDiv = document.getElementById('imc-tabela');

        if (!pesoInput || !alturaInput || !resultadoDiv) return;

        function atualizarIMC() {
            const peso = pesoInput.value.replace(',', '.');
            const altura = alturaInput.value.replace(',', '.');
            const imc = calcularIMC(peso, altura);

            if (imc === null) {
                resultadoDiv.innerHTML = '<p style="color:red;">Preencha peso e altura com valores válidos (positivos).</p>';
                return;
            }

            const classificacao = classificarIMC(imc);
            resultadoDiv.innerHTML = `
                <p><strong>Seu IMC:</strong> ${imc.toFixed(2)}</p>
                <p><strong>Classificação:</strong> ${classificacao}</p>
                <p style="font-size:0.85rem;color:#666;margin-top:8px;">${CONFIG.imcDisclaimer}</p>
            `;
        }

        pesoInput.addEventListener('input', atualizarIMC);
        alturaInput.addEventListener('input', atualizarIMC);

        // Renderizar tabela OMS
        if (tabelaDiv) {
            let tabelaHTML = '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;max-width:500px;margin-top:12px;">';
            tabelaHTML += '<thead><tr><th>IMC</th><th>Classificação</th></tr></thead><tbody>';
            const faixas = [
                { min: 0, max: 18.4, label: 'Abaixo do peso' },
                { min: 18.5, max: 24.9, label: 'Normal' },
                { min: 25, max: 29.9, label: 'Sobrepeso' },
                { min: 30, max: 34.9, label: 'Obesidade Grau I' },
                { min: 35, max: 39.9, label: 'Obesidade Grau II' },
                { min: 40, max: Infinity, label: 'Obesidade Grau III' }
            ];
            faixas.forEach(f => {
                const maxStr = f.max === Infinity ? '≥40' : f.max;
                tabelaHTML += `<tr><td>${f.min} – ${maxStr}</td><td>${f.label}</td></tr>`;
            });
            tabelaHTML += '</tbody></table>';
            tabelaDiv.innerHTML = tabelaHTML;
        }
    }

    // ============================================================
    // 5. MÓDULO DE RECOMENDAÇÃO
    // ============================================================
    function moduloRecomendacao() {
        const objetivoSelect = document.getElementById('recomendacao-objetivo');
        const orcamentoInput = document.getElementById('recomendacao-orcamento');
        const resultadoDiv = document.getElementById('recomendacao-resultado');

        if (!objetivoSelect || !orcamentoInput || !resultadoDiv) return;

        function atualizarRecomendacao() {
            const objetivo = parseInt(objetivoSelect.value);
            const orcamento = parseFloat(orcamentoInput.value.replace(',', '.'));

            if (!objetivo || !validarNumeroPositivo(orcamento)) {
                resultadoDiv.innerHTML = '<p style="color:red;">Selecione um objetivo e informe um orçamento diário válido (positivo).</p>';
                return;
            }

            // Filtrar produtos por objetivo
            const filtrados = produtos.filter(p => p.objetivo === objetivo);
            if (filtrados.length === 0) {
                resultadoDiv.innerHTML = '<p>Nenhum produto encontrado para este objetivo.</p>';
                return;
            }

            // Calcular valor por porção e verificar compatibilidade com orçamento
            const recomendacoes = filtrados.map(p => {
                const valorPorPorcao = parseFloat(calcularValorPorPorcao(p.preco, p.porcoesDia));
                const porcoesPossiveis = Math.floor(orcamento / valorPorPorcao);
                const porcoesMax = Math.min(porcoesPossiveis, p.porcoesDia); // respeitar limite diário
                const custoTotal = porcoesMax * valorPorPorcao;
                return {
                    ...p,
                    valorPorPorcao,
                    porcoesRecomendadas: porcoesMax,
                    custoTotal
                };
            }).filter(r => r.porcoesRecomendadas > 0);

            if (recomendacoes.length === 0) {
                resultadoDiv.innerHTML = '<p>Nenhum produto se encaixa no seu orçamento diário. Considere aumentar o valor ou escolher outro objetivo.</p>';
                return;
            }

            // Ordenar por melhor custo-benefício (menor valor por porção)
            recomendacoes.sort((a, b) => a.valorPorPorcao - b.valorPorPorcao);

            // Montar tabela
            let html = '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;max-width:700px;">';
            html += '<thead><tr><th>Produto</th><th>Categoria</th><th>Preço (R$)</th><th>Porções/dia</th><th>Valor porção (R$)</th><th>Recomendação</th><th>Custo diário (R$)</th></tr></thead><tbody>';
            recomendacoes.forEach(r => {
                html += `<tr>
                    <td>${r.nome}</td>
                    <td>${r.categoria}</td>
                    <td>${r.preco.toFixed(2)}</td>
                    <td>${r.porcoesDia}</td>
                    <td>${r.valorPorPorcao.toFixed(2)}</td>
                    <td>${r.porcoesRecomendadas} porção(ões)</td>
                    <td>${r.custoTotal.toFixed(2)}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            html += `<p style="margin-top:8px;font-size:0.9rem;">Orçamento diário: R$ ${orcamento.toFixed(2)} | Total sugerido: R$ ${recomendacoes.reduce((acc, r) => acc + r.custoTotal, 0).toFixed(2)}</p>`;
            resultadoDiv.innerHTML = html;
        }

        objetivoSelect.addEventListener('change', atualizarRecomendacao);
        orcamentoInput.addEventListener('input', atualizarRecomendacao);
    }

    // ============================================================
    // 6. MÓDULO DE INTERFACE (Header, proteção, navegação)
    // ============================================================
    function injetarHeader() {
        // Verificar se já existe header
        if (document.querySelector('.sticky-header')) return;

        const headerHTML = `
            <header class="sticky-header" role="banner" aria-label="Barra de navegação principal">
                <a href="/" aria-label="Página inicial" class="topbar-brand">
                    <img src="assets/img/logo-edusidegum.webp" alt="Edu Sidegum — Distribuidor Independente Herbalife"
                         class="topbar-logo" width="128" height="128" loading="eager" fetchpriority="high">
                </a>
                <nav class="menu-toggle" aria-label="Menu principal">
                    <button class="menu-btn" aria-label="Abrir menu">☰ Menu</button>
                    <ul class="menu-dropdown">
                        <li><a href="/">Home</a></li>
                        <li><a href="/manifesto.html">Manifesto</a></li>
                        <li><a href="https://catalogoherbalife.com.br/edusidegum" target="_blank" rel="noopener">Catálogo</a></li>
                        <li><a href="https://edusidegum.github.io/cadastro/cadastro.html" target="_blank" rel="noopener">Cliente Premium</a></li>
                        <li><a href="https://edusidegum.github.io/cadastro/cadastro.html" target="_blank" rel="noopener">Novo Consultor</a></li>
                    </ul>
                </nav>
                <a href="https://wa.me/5551999663200?text=Quero%20Saber%20mais" class="btn-cta"
                   target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
                    💬 Fale Conosco
                </a>
            </header>
            <div class="header-spacer"></div>
        `;
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    function ativarProtecaoCopia() {
        // Bloqueia seleção de texto
        const style = document.createElement('style');
        style.textContent = 'body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}';
        document.head.appendChild(style);

        // Intercepta Ctrl+C
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
                const s = window.getSelection();
                if (s && s.toString().length > 0) {
                    e.preventDefault();
                    return false;
                }
            }
        });

        // Substitui conteúdo copiado
        document.addEventListener('copy', function(e) {
            e.preventDefault();
            e.clipboardData.setData('text/plain', 'Cópia não autorizada.');
        });

        // Previne menu de contexto
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }

    function adicionarBotaoImprimir() {
        const btnContainer = document.getElementById('btn-imprimir-container');
        if (!btnContainer) return;
        const btn = document.createElement('a');
        btn.href = 'autoavaliacao.html';
        btn.className = 'btn-imprimir';
        btn.textContent = '🖨️ Imprimir ficha';
        btn.style.cssText = 'display:inline-block;padding:10px 20px;background:#78BE20;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:20px;';
        btnContainer.appendChild(btn);
    }

    // ============================================================
    // 7. INICIALIZAÇÃO
    // ============================================================
    function init() {
        // Injetar header e proteção
        injetarHeader();
        ativarProtecaoCopia();

        // Inicializar módulos
        moduloIMC();
        moduloRecomendacao();
        adicionarBotaoImprimir();

        // Adicionar CSS base se não existir
        if (!document.querySelector('link[href="assets/css/style.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/style.css';
            document.head.appendChild(link);
        }
    }

    // Aguardar DOM pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
