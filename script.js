// Elementos DOM
const autorizacaoForm = document.getElementById('autorizacaoForm');
const gerarPdfBtn = document.getElementById('gerarPdfBtn');
const salvarJsonBtn = document.getElementById('salvarJsonBtn');
const restaurarDadosBtn = document.getElementById('restaurarDadosBtn');
const reiniciarFormBtn = document.getElementById('reiniciarFormBtn');
const arquivoJson = document.getElementById('arquivoJson');

// Containers condicionais
const validadeDataContainer = document.getElementById('validadeDataContainer');
const validadeMesesContainer = document.getElementById('validadeMesesContainer');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    aplicarMascaras();
    preencherDataAtual();
});

// Preencher data atual
function preencherDataAtual() {
    const hoje = new Date();
    document.getElementById('diaDocumento').value = hoje.getDate();
    document.getElementById('anoDocumento').value = hoje.getFullYear();
    
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    document.getElementById('mesDocumento').value = meses[hoje.getMonth()];
}

// Inicializar eventos
function inicializarEventos() {
    // Toggle validade por data ou meses
    const radioValidade = document.querySelectorAll('input[name="tipoValidade"]');
    radioValidade.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'data') {
                validadeDataContainer.style.display = 'block';
                validadeMesesContainer.style.display = 'none';
            } else if (this.value === 'meses') {
                validadeDataContainer.style.display = 'none';
                validadeMesesContainer.style.display = 'block';
            }
        });
    });

    // Botões de ação
    gerarPdfBtn.addEventListener('click', gerarPDF);
    salvarJsonBtn.addEventListener('click', salvarJSON);
    restaurarDadosBtn.addEventListener('click', () => arquivoJson.click());
    reiniciarFormBtn.addEventListener('click', reiniciarFormulario);
    arquivoJson.addEventListener('change', restaurarDados);
}

// Aplicar máscaras nos campos
function aplicarMascaras() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpfResponsavel');
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Máscara para telefone
    const telefoneInput = document.getElementById('telefones');
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Formatar primeiro telefone
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        } else {
            // Dois telefones
            let tel1 = value.substring(0, 11);
            let tel2 = value.substring(11, 22);
            
            tel1 = tel1.replace(/(\d{2})(\d)/, '($1) $2');
            tel1 = tel1.replace(/(\d{5})(\d)/, '$1-$2');
            
            if (tel2.length > 0) {
                tel2 = tel2.replace(/(\d{2})(\d)/, '($1) $2');
                tel2 = tel2.replace(/(\d{4,5})(\d)/, '$1-$2');
                value = tel1 + ', ' + tel2;
            } else {
                value = tel1;
            }
        }
        
        e.target.value = value;
    });

    // Máscara para RG/Identidade
    const identidadeInputs = document.querySelectorAll('input[id*="identidade"]');
    identidadeInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9Xx]/g, '');
            if (value.length > 2) {
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
            }
            if (value.length > 6) {
                value = value.replace(/(\d{2}\.\d{3})(\d)/, '$1.$2');
            }
            if (value.length > 10) {
                value = value.replace(/(\d{2}\.\d{3}\.\d{3})(\w{1})/, '$1-$2');
            }
            e.target.value = value.toUpperCase();
        });
    });
}

// Coletar dados do formulário
function coletarDados() {
    const tipoViagem = document.querySelector('input[name="tipoViagem"]:checked');
    const tipoValidade = document.querySelector('input[name="tipoValidade"]:checked');
    
    const dados = {
        responsavel: {
            nome: document.getElementById('nomeResponsavel').value,
            identidade: document.getElementById('identidadeResponsavel').value,
            orgaoExpedidor: document.getElementById('orgaoExpedidor').value,
            cpf: document.getElementById('cpfResponsavel').value,
            endereco: document.getElementById('endereco').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidadeResponsavel').value,
            uf: document.getElementById('ufResponsavel').value,
            telefones: document.getElementById('telefones').value
        },
        crianca: {
            nome: document.getElementById('nomeCrianca').value,
            nascimento: {
                dia: document.getElementById('diaNascimento').value,
                mes: document.getElementById('mesNascimento').value,
                ano: document.getElementById('anoNascimento').value
            }
        },
        destino: {
            cidade: document.getElementById('cidadeDestino').value,
            uf: document.getElementById('ufDestino').value
        },
        acompanhante: {
            nome: document.getElementById('nomeAcompanhante').value,
            identidade: document.getElementById('identidadeAcompanhante').value,
            orgaoExpedidor: document.getElementById('orgaoExpedidorAcompanhante').value
        },
        autorizacao: {
            tipoViagem: tipoViagem ? tipoViagem.value : '',
            tipoValidade: tipoValidade ? tipoValidade.value : '',
            validadeData: {
                dia: document.getElementById('diaValidade').value,
                mes: document.getElementById('mesValidade').value,
                ano: document.getElementById('anoValidade').value
            },
            validadeMeses: document.getElementById('quantidadeMeses').value
        },
        documento: {
            cidade: document.getElementById('cidadeDocumento').value,
            dia: document.getElementById('diaDocumento').value,
            mes: document.getElementById('mesDocumento').value,
            ano: document.getElementById('anoDocumento').value
        }
    };

    return dados;
}

// Validar formulário
function validarFormulario() {
    const camposObrigatorios = [
        { id: 'nomeResponsavel', nome: 'Nome do Responsável' },
        { id: 'identidadeResponsavel', nome: 'Identidade do Responsável' },
        { id: 'orgaoExpedidor', nome: 'Órgão Expedidor' },
        { id: 'cpfResponsavel', nome: 'CPF do Responsável' },
        { id: 'endereco', nome: 'Endereço' },
        { id: 'numero', nome: 'Número' },
        { id: 'bairro', nome: 'Bairro' },
        { id: 'cidadeResponsavel', nome: 'Cidade' },
        { id: 'ufResponsavel', nome: 'UF' },
        { id: 'telefones', nome: 'Telefones' },
        { id: 'nomeCrianca', nome: 'Nome da Criança' },
        { id: 'diaNascimento', nome: 'Dia de Nascimento' },
        { id: 'mesNascimento', nome: 'Mês de Nascimento' },
        { id: 'anoNascimento', nome: 'Ano de Nascimento' },
        { id: 'cidadeDestino', nome: 'Cidade de Destino' },
        { id: 'ufDestino', nome: 'UF de Destino' },
        { id: 'nomeAcompanhante', nome: 'Nome do Acompanhante' },
        { id: 'identidadeAcompanhante', nome: 'Identidade do Acompanhante' },
        { id: 'orgaoExpedidorAcompanhante', nome: 'Órgão Expedidor do Acompanhante' },
        { id: 'cidadeDocumento', nome: 'Cidade do Documento' },
        { id: 'diaDocumento', nome: 'Dia do Documento' },
        { id: 'mesDocumento', nome: 'Mês do Documento' },
        { id: 'anoDocumento', nome: 'Ano do Documento' }
    ];

    let valido = true;
    const camposInvalidos = [];

    camposObrigatorios.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (!elemento.value.trim()) {
            valido = false;
            camposInvalidos.push(campo.nome);
            elemento.style.borderColor = '#c44536';
        } else {
            elemento.style.borderColor = '#2d8659';
        }
    });

    // Validar radios
    const tipoViagem = document.querySelector('input[name="tipoViagem"]:checked');
    const tipoValidade = document.querySelector('input[name="tipoValidade"]:checked');

    if (!tipoViagem) {
        valido = false;
        camposInvalidos.push('Tipo de Viagem (ida/ida e volta)');
    }

    if (!tipoValidade) {
        valido = false;
        camposInvalidos.push('Tipo de Validade');
    }

    // Validar campos de validade específicos
    if (tipoValidade) {
        if (tipoValidade.value === 'data') {
            const dia = document.getElementById('diaValidade').value;
            const mes = document.getElementById('mesValidade').value;
            const ano = document.getElementById('anoValidade').value;
            if (!dia || !mes || !ano) {
                valido = false;
                camposInvalidos.push('Data de Validade');
            }
        } else if (tipoValidade.value === 'meses') {
            const meses = document.getElementById('quantidadeMeses').value;
            if (!meses) {
                valido = false;
                camposInvalidos.push('Quantidade de Meses');
            }
        }
    }

    if (!valido) {
        alert('Por favor, preencha os seguintes campos:\n\n' + camposInvalidos.join('\n'));
        return false;
    }

    return true;
}

// Gerar PDF
function gerarPDF() {
    if (!validarFormulario()) return;

    const dados = coletarDados();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const margem = 20;
    let y = 25;
    const larguraUtil = 170;

    // Título
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('AUTORIZAÇÃO PARA CRIANÇA VIAJAR PELO BRASIL', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(11);
    doc.text('ACOMPANHADA DE PESSOA MAIOR', 105, y, { align: 'center' });
    y += 15;

    // Corpo do documento
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    // Primeiro parágrafo - Dados do Responsável
    const endereco = dados.responsavel.complemento 
        ? `${dados.responsavel.endereco}, nº ${dados.responsavel.numero}, compl. ${dados.responsavel.complemento}`
        : `${dados.responsavel.endereco}, nº ${dados.responsavel.numero}`;
    
    let texto = `Eu, ${dados.responsavel.nome}, identidade nº ${dados.responsavel.identidade}, `;
    texto += `órgão expedidor ${dados.responsavel.orgaoExpedidor}, CPF nº ${dados.responsavel.cpf}, residente `;
    texto += `na ${endereco}, bairro ${dados.responsavel.bairro}, `;
    texto += `cidade ${dados.responsavel.cidade}, UF ${dados.responsavel.uf}, `;
    texto += `telefones ${dados.responsavel.telefones}, AUTORIZO meu(minha) filho(a) `;
    texto += `${dados.crianca.nome}, data de nascimento ${dados.crianca.nascimento.dia}/${dados.crianca.nascimento.mes}/${dados.crianca.nascimento.ano}, `;
    texto += `a viajar para a cidade de ${dados.destino.cidade}, UF ${dados.destino.uf}, acompanhado(a) do(a) `;
    texto += `Sr(a) ${dados.acompanhante.nome}, identidade nº ${dados.acompanhante.identidade}, `;
    texto += `órgão expedidor ${dados.acompanhante.orgaoExpedidor}, conforme o artigo 83, § 1º, b, 2, `;
    texto += `da Lei 8069, de 13 de julho de 1990, Estatuto da Criança e do Adolescente - ECA.`;

    const linhas = doc.splitTextToSize(texto, larguraUtil);
    doc.text(linhas, margem, y);
    y += linhas.length * 6 + 15;

    // Local e data
    const mesCapitalizado = dados.documento.mes.charAt(0).toUpperCase() + dados.documento.mes.slice(1);
    doc.text(`${dados.documento.cidade}, ${dados.documento.dia} de ${mesCapitalizado} de ${dados.documento.ano}.`, margem, y);
    y += 25;

    // Linha de assinatura
    doc.setLineWidth(0.5);
    doc.line(50, y, 160, y);
    y += 5;
    doc.setFontSize(10);
    doc.text('(assinatura do genitor ou genitora ou responsável)', 105, y, { align: 'center' });
    y += 5;
    doc.text('(Reconhecer firma por semelhança ou autenticidade)', 105, y, { align: 'center' });
    y += 15;

    // Tipo de viagem
    doc.setFontSize(11);
    const idaChecked = dados.autorizacao.tipoViagem === 'ida' ? 'X' : ' ';
    const idaVoltaChecked = dados.autorizacao.tipoViagem === 'idaVolta' ? 'X' : ' ';
    
    doc.text(`( ${idaChecked} ) Esta autorização é válida apenas para ida.`, margem, y);
    y += 7;
    doc.text(`( ${idaVoltaChecked} ) Esta autorização é válida para ida e volta.`, margem, y);
    y += 12;

    // Validade
    doc.text('Esta autorização é válida:', margem, y);
    y += 7;

    const dataChecked = dados.autorizacao.tipoValidade === 'data' ? 'X' : ' ';
    const mesesChecked = dados.autorizacao.tipoValidade === 'meses' ? 'X' : ' ';

    if (dados.autorizacao.tipoValidade === 'data') {
        doc.text(`( ${dataChecked} ) até ${dados.autorizacao.validadeData.dia}/${dados.autorizacao.validadeData.mes}/${dados.autorizacao.validadeData.ano}.`, margem, y);
    } else {
        doc.text(`( ${dataChecked} ) até ____/____/20____.`, margem, y);
    }
    y += 7;

    if (dados.autorizacao.tipoValidade === 'meses') {
        doc.text(`( ${mesesChecked} ) por ${dados.autorizacao.validadeMeses} meses.`, margem, y);
    } else {
        doc.text(`( ${mesesChecked} ) por _________________ meses.`, margem, y);
    }
    y += 15;

    // Aviso
    doc.setFont(undefined, 'bold');
    doc.text('ATENÇÃO:', margem, y);
    doc.setFont(undefined, 'normal');
    y += 7;
    doc.text('Apresentar Certidão de Nascimento da criança ou Documento de Identidade com foto.', margem, y);

    // Salvar PDF
    const nomeArquivo = `autorizacao_viagem_${dados.crianca.nome.replace(/\s+/g, '_')}.pdf`;
    doc.save(nomeArquivo);
}

// Salvar JSON
function salvarJSON() {
    if (!validarFormulario()) return;

    const dados = coletarDados();
    const jsonString = JSON.stringify(dados, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `autorizacao_viagem_${dados.crianca.nome.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Restaurar dados do JSON
function restaurarDados(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            preencherFormulario(dados);
            alert('Dados restaurados com sucesso!');
        } catch (error) {
            alert('Erro ao ler o arquivo JSON. Verifique se o arquivo está correto.');
        }
    };
    reader.readAsText(file);
}

// Preencher formulário com dados
function preencherFormulario(dados) {
    // Dados do responsável
    document.getElementById('nomeResponsavel').value = dados.responsavel.nome || '';
    document.getElementById('identidadeResponsavel').value = dados.responsavel.identidade || '';
    document.getElementById('orgaoExpedidor').value = dados.responsavel.orgaoExpedidor || '';
    document.getElementById('cpfResponsavel').value = dados.responsavel.cpf || '';
    document.getElementById('endereco').value = dados.responsavel.endereco || '';
    document.getElementById('numero').value = dados.responsavel.numero || '';
    document.getElementById('complemento').value = dados.responsavel.complemento || '';
    document.getElementById('bairro').value = dados.responsavel.bairro || '';
    document.getElementById('cidadeResponsavel').value = dados.responsavel.cidade || '';
    document.getElementById('ufResponsavel').value = dados.responsavel.uf || '';
    document.getElementById('telefones').value = dados.responsavel.telefones || '';

    // Dados da criança
    document.getElementById('nomeCrianca').value = dados.crianca.nome || '';
    document.getElementById('diaNascimento').value = dados.crianca.nascimento.dia || '';
    document.getElementById('mesNascimento').value = dados.crianca.nascimento.mes || '';
    document.getElementById('anoNascimento').value = dados.crianca.nascimento.ano || '';

    // Dados do destino
    document.getElementById('cidadeDestino').value = dados.destino.cidade || '';
    document.getElementById('ufDestino').value = dados.destino.uf || '';

    // Dados do acompanhante
    document.getElementById('nomeAcompanhante').value = dados.acompanhante.nome || '';
    document.getElementById('identidadeAcompanhante').value = dados.acompanhante.identidade || '';
    document.getElementById('orgaoExpedidorAcompanhante').value = dados.acompanhante.orgaoExpedidor || '';

    // Tipo de viagem
    if (dados.autorizacao.tipoViagem) {
        const radioViagem = document.querySelector(`input[name="tipoViagem"][value="${dados.autorizacao.tipoViagem}"]`);
        if (radioViagem) radioViagem.checked = true;
    }

    // Tipo de validade
    if (dados.autorizacao.tipoValidade) {
        const radioValidade = document.querySelector(`input[name="tipoValidade"][value="${dados.autorizacao.tipoValidade}"]`);
        if (radioValidade) {
            radioValidade.checked = true;
            radioValidade.dispatchEvent(new Event('change'));
        }
    }

    // Validade por data
    document.getElementById('diaValidade').value = dados.autorizacao.validadeData.dia || '';
    document.getElementById('mesValidade').value = dados.autorizacao.validadeData.mes || '';
    document.getElementById('anoValidade').value = dados.autorizacao.validadeData.ano || '';

    // Validade por meses
    document.getElementById('quantidadeMeses').value = dados.autorizacao.validadeMeses || '';

    // Dados do documento
    document.getElementById('cidadeDocumento').value = dados.documento.cidade || '';
    document.getElementById('diaDocumento').value = dados.documento.dia || '';
    document.getElementById('mesDocumento').value = dados.documento.mes || '';
    document.getElementById('anoDocumento').value = dados.documento.ano || '';
}

// Reiniciar formulário
function reiniciarFormulario() {
    if (confirm('Tem certeza que deseja reiniciar o formulário? Todos os dados preenchidos serão perdidos.')) {
        // Limpar todos os campos
        const todosOsInputs = document.querySelectorAll('input, select, textarea');
        todosOsInputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            } else if (input.type !== 'file') {
                input.value = '';
            }
            input.style.borderColor = '';
        });

        // Esconder containers condicionais
        validadeDataContainer.style.display = 'none';
        validadeMesesContainer.style.display = 'none';

        // Limpar arquivo JSON selecionado
        arquivoJson.value = '';

        // Preencher data atual novamente
        preencherDataAtual();

        alert('Formulário reiniciado com sucesso!');
    }
}

