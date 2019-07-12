module.exports = {
  mkCabecalhoIntercambio: mkCabecalhoIntercambio,
  mkCabecalhoDocumento:   mkCabecalhoDocumento,
  mkDadosEmbarcadora:     mkDadosEmbarcadora,
  mkDadosDestinatario:    mkDadosDestinatario
};

/* Enumerações */
const N = 1;
const A = 2;


/* Funções auxiliares */

/**
 * formataCampo - ajusta um número ou string de acordo com o formato especificado
 *
 * @param  {Object}         data          Valor e dados sobre seu formato
 * @param  {string}         data.campo    Nome do campo utilizado para mensagens de erro
 * @param  {string|number}  data.valor    O valor a ser formatado
 * @param  {number}         data.tipo     O tipo de campo a ser formatado (N=1, A=2)
 * @param  {number}         data.tamanho  O tamanho total que o campo deve ter
 * @param  {number}         data.decimal  A quantidade de casas decimais (obrigatório se o tipo do dado for numérico)
 *
 * @return {Object}         Objeto contendo ".valor" {string} e ".erro" {string ou null}.
 */
function formataCampo(data) {
  // Retorno da função
  let retval = {
    erro: null, // {string | null}
    valor: ''   // {string}
  };

  // Verifica o tipo
  if(!data.tipo){
    retval.erro = `Erro de argumento: o tipo do campo deve ser informado. ${JSON.stringify(data)}`;
    return retval;
  }

  // O tipo de campo é NUMÉRICO
  if(data.tipo == N){
    // Verifica existência dos campos obrigatórios
    if(data.valor===undefined || data.tamanho===undefined || data.decimal===undefined || data.campo===undefined){
      retval.erro = `Erro de argumento: todos os dados do campo devem ser informados. ${JSON.stringify(data)}`;
      return retval;
    }

    // Corta casas decimais desnecessárias
    var numeroComDecimal = Number(data.valor).toFixed(data.decimal);

    // Verifica se o resultado é um número (pega erros como strings com vírgula)
    if(Number.isNaN(numeroComDecimal) || numeroComDecimal=="NaN"){
      retval.erro = `Erro de argumento: número inválido informado para o campo "${data.campo}" (${data.valor}).`;
      return retval;
    }

    // Converte para string e remove o separador decimal
    var numeroComPontoRemovido = String(numeroComDecimal).replace(".", "");

    // Verifica se o atual formato do número cabe no campo
    if(data.tamanho < numeroComPontoRemovido.length){
      retval.erro = `Erro de tamanho: campo "${data.campo}" deve ter tamanho ${data.tamanho} mas o conteúdo tem ${numeroComPontoRemovido.length}`;
      return retval;
    }

    // Preenche o campo com zeros à esquerda
    retval.valor = "0".repeat(data.tamanho - numeroComPontoRemovido.length) + numeroComPontoRemovido;
    return retval;
  }

  // O tipo de campo é ALFANUMÉRICO
  if(data.tipo == A){
    // Verifica existência dos campos obrigatórios
    if(data.valor===undefined || data.tamanho===undefined || data.campo===undefined){
      retval.erro = `Erro de argumento: todos os dados do campo devem ser informados. ${JSON.stringify(data)}`;
      return retval;
    }

    // Verifica se o atual formato do valor cabe no campo
    if(data.tamanho < data.valor.length){
      retval.erro = `Erro de tamanho: campo "${data.campo}" deve ter tamanho ${data.tamanho} mas o conteúdo tem ${data.valor.length}`;
      return retval;
    }

    // Preenche o campo com espaços à direita
    retval.valor = data.valor + " ".repeat(data.tamanho - data.valor.length);
    return retval;
  }

  retval.erro = `Erro de argumento: tipo do campo inválido. ${JSON.stringify(data)}`;
  return retval;
}


/* Funções principais - formatadores de registros */

/**
 * mkCabecalhoIntercambio - cria CABEÇALHO DE INTERCÂMBIO - NOTFIS 3.1
 *
 * @param  {Object}  data               Dados para construir a linha
 * @param  {string}  data.remetente     NOME DA CAIXA POSTAL DO REMETENTE
 * @param  {string}  data.destinatario  NOME DA CAIXA POSTAL DO DESTINATÁRIO
 * @param  {string}  data.data          DDMMAA (ESTA DATA É DE USO DA APLICAÇÃO EDI, NÃO SENDO NECESSÁRIA ESTAR NO FORMATO DDMMAAAA).
 * @param  {string}  data.hora          HHMM
 * @param  {string}  data.identificacao SUGESTÃO: "NOTDDMMHHMMS"

 * @return {Object}  Objeto contendo ".valor" {string} e ".erro" {string ou null}.
 */
function mkCabecalhoIntercambio(data) {
  // Retorno da função
  let retval = {
    erro: null, // {string | null}
    valor: ''   // {string}
  };

  // Verifica existência dos campos obrigatórios
  if (data.remetente === undefined || data.destinatario === undefined || data.data === undefined || data.hora === undefined || data.identificacao === undefined) {
    retval.erro = `Erro de argumento (mkCabecalhoIntercambio): todos os dados da linha devem ser informados. ${JSON.stringify(data)}`;
    return retval;
  }

  var campos = [

    formataCampo({
      campo: 'IDENTIFICADOR DE REGISTRO'
      , valor: '000'
      , tipo: N
      , tamanho: 3
      , decimal: 0
    }),

    formataCampo({
      campo: 'IDENTIFICAÇÃO DO REMETENTE'
      , valor: data.remetente
      , tipo: A
      , tamanho: 35
      , decimal: 0
    }),

    formataCampo({
      campo: 'IDENTIFICAÇÃO DO DESTINATÁRIO'
      , valor: data.destinatario
      , tipo: A
      , tamanho: 35
      , decimal: 0
    }),

    formataCampo({
      campo: 'DATA'
      , valor: data.data
      , tipo: N
      , tamanho: 6
      , decimal: 0
    }),

    formataCampo({
      campo: 'HORA'
      , valor: data.hora
      , tipo: N
      , tamanho: 4
      , decimal: 0
    }),

    formataCampo({
      campo: 'IDENTIFICAÇÃO DO INTERCÂMBIO'
      , valor: data.identificacao
      , tipo: A
      , tamanho: 12
      , decimal: 0
    }),

    formataCampo({
      campo: 'FILLER'
      , valor: ''
      , tipo: A
      , tamanho: 145
      , decimal: 0
    })
  ];

  // Concatena erros e valores para formar a linha
  campos.forEach(campo => {
    if (campo.erro) {
      retval.erro = retval.erro ? retval.erro + campo.erro : campo.erro;
    }
    retval.valor += campo.valor;
  })

  // Apaga o retorno se houver um erro. Não se deve utilizá-lo neste caso.
  if (retval.erro) {
    retval.valor = '';
  }

  return retval;
}

/**
 * mkCabecalhoDocumento - cria CABEÇALHO DE DOCUMENTO - NOTFIS 3.1
 *
 * @param  {Object}  data               Dados para construir a linha
 * @param  {string}  data.identificacao SUGESTÃO: "NOTFIDDMMHHMMS"

 * @return {Object}  Objeto contendo ".valor" {string} e ".erro" {string ou null}.
 */
function mkCabecalhoDocumento(data) {
  // Retorno da função
  let retval = {
    erro: null, // {string | null}
    valor: ''   // {string}
  };

  // Verifica existência dos campos obrigatórios
  if (data.identificacao === undefined) {
    retval.erro = `Erro de argumento (mkCabecalhoDocumento): todos os dados da linha devem ser informados. ${JSON.stringify(data)}`;
    return retval;
  }

  var campos = [
    formataCampo({
      campo: 'IDENTIFICADOR DE REGISTRO'
      , valor: '310'
      , tipo: N
      , tamanho: 3
      , decimal: 0
    }),

    formataCampo({
      campo: 'IDENTIFICAÇÃO DO DOCUMENTO'
      , valor: data.identificacao
      , tipo: A
      , tamanho: 14
      , decimal: 0
    }),

    formataCampo({
      campo: 'FILLER'
      , valor: ''
      , tipo: A
      , tamanho: 223
      , decimal: 0
    })
  ];

  // Concatena erros e valores para formar a linha
  campos.forEach(campo => {
    if (campo.erro) {
      retval.erro = retval.erro ? retval.erro + campo.erro : campo.erro;
    }
    retval.valor += campo.valor;
  })

  // Apaga o retorno se houver um erro. Não se deve utilizá-lo neste caso.
  if (retval.erro) {
    retval.valor = '';
  }

  return retval;
}

/**
 * mkDadosEmbarcadora - cria DADOS DA EMBARCADORA - NOTFIS 3.1
 *
 * @param  {Object}  data             Dados para construir a linha
 * @param  {number}  data.cnpj        O CNPJ da empresa embarcadora (somente números)
 * @param  {number}  data.ie          A inscrição estadual da embarcadora (somente números)
 * @param  {string}  data.endereco    Endereço da embarcadora
 * @param  {string}  data.cidade      Cidade da embarcadora
 * @param  {number}  data.cep         O CEP da embarcadora (somente números)
 * @param  {string}  data.estado      UF da embarcadora (2 dígitos ex.: SC, TO)
 * @param  {string}  data.data        Data do embarque no formato DDMMAAAA
 * @param  {string}  data.nome_embarcadora Nome da empresa embarcadora (razão social)
 * @return {Object}  Objeto contendo ".valor" {string} e ".erro" {string ou null}.
 */
function mkDadosEmbarcadora(data) {
  // Retorno da função
  let retval = {
    erro: null, // {string | null}
    valor: ''   // {string}
  };

  // Verifica existência dos campos obrigatórios
  if (
    data.cnpj     === undefined ||
    data.ie       === undefined ||
    data.endereco === undefined ||
    data.cidade   === undefined ||
    data.cep      === undefined ||
    data.estado   === undefined ||
    data.data     === undefined ||
    data.nome_embarcadora === undefined
  ) {
    retval.erro = `Erro de argumento (mkDadosEmbarcadora): todos os dados da linha devem ser informados. ${JSON.stringify(data)}`;
    return retval;
  }

  var campos = [
    formataCampo({
      campo: 'IDENTIFICADOR DE REGISTRO'
      , valor: '311'
      , tipo: N
      , tamanho: 3
      , decimal: 0
    }),

    formataCampo({
      campo: 'CGC/CNPJ'
      , valor: data.cnpj
      , tipo: N
      , tamanho: 14
      , decimal: 0
    }),

    formataCampo({
      campo: 'INSCRIÇÃO ESTADUAL'
      , valor: data.ie
      , tipo: A
      , tamanho: 15
      , decimal: 0
    }),

    formataCampo({
      campo: 'ENDEREÇO'
      , valor: data.endereco
      , tipo: A
      , tamanho: 40
      , decimal: 0
    }),

    formataCampo({
      campo: 'CIDADE'
      , valor: data.cidade
      , tipo: A
      , tamanho: 35
      , decimal: 0
    }),

    formataCampo({
      campo: 'CEP'
      , valor: data.cep
      , tipo: A
      , tamanho: 9
      , decimal: 0
    }),

    formataCampo({
      campo: 'ESTADO (2 DIGITOS)'
      , valor: data.estado
      , tipo: A
      , tamanho: 9
      , decimal: 0
    }),

    formataCampo({
      campo: 'DATA DE EMBARQUE'
      , valor: data.data
      , tipo: N
      , tamanho: 8
      , decimal: 0
    }),

    formataCampo({
      campo: 'NOME DA EMPRESA EMBARCADORA (RAZÃO SOCIAL)'
      , valor: data.nome_embarcadora
      , tipo: A
      , tamanho: 40
      , decimal: 0
    }),

    formataCampo({
      campo: 'FILLER'
      , valor: ''
      , tipo: A
      , tamanho: 67
      , decimal: 0
    })
  ];

  // Concatena erros e valores para formar a linha
  campos.forEach(campo => {
    if (campo.erro) {
      retval.erro = retval.erro ? retval.erro + campo.erro : campo.erro;
    }
    retval.valor += campo.valor;
  })

  // Apaga o retorno se houver um erro. Não se deve utilizá-lo neste caso.
  if (retval.erro) {
    retval.valor = '';
  }

  return retval;
}

/**
 * mkDadosDestinatario - cria DADOS DO DESTINATÁRIO - NOTFIS 3.1
 *
 * @param  {Object}  data               Dados para construir a linha
 * @param  {string}  data.razao_social  A razão social do destinatário
 * @param  {number}  data.cnpj_cpf      O CNPJ ou CPF do destinatario (somente números)
 * @param  {number}  data.ie            A inscrição estadual do destinatário (somente números)
 * @param  {string}  data.endereco      Endereço do destinatário
 * @param  {string}  data.bairro        Bairro do destinatário
 * @param  {string}  data.cidade        Cidade do destinatário
 * @param  {number}  data.cep           O CEP do destinatário (somente números)
 * @param  {string}  data.estado        UF do destinatário (2 dígitos ex.: SC, TO)
 * @param  {string}  data.area_de_frete Tabela acordada entre embarcadora e transportadora
 * @param  {string}  data.codigo_de_municipio           Tabela acordada entre embarcadora e transportadora
 * @param  {string}  data.numero_de_comunicacao         Telefone, fax, etc. do destinatario
 * @param  {string}  data.tipo_identificacao_cnpj_cpf   Indica se o campo "cnpj_cpf" é 1=CNPJ ou 2=CPF (somente o número)
 * @return {Object}  Objeto contendo ".valor" {string} e ".erro" {string ou null}.
 */
function mkDadosDestinatario(data) {
  // Retorno da função
  let retval = {
    erro: null, // {string | null}
    valor: ''   // {string}
  };

  // Verifica existência dos campos obrigatórios
  if (
    data.razao_social   === undefined ||
    data.cnpj_cpf       === undefined ||
    data.ie             === undefined ||
    data.endereco       === undefined ||
    data.bairro         === undefined ||
    data.cidade         === undefined ||
    data.cep            === undefined ||
    data.estado         === undefined ||
    data.area_de_frete  === undefined ||
    data.codigo_de_municipio          === undefined ||
    data.numero_de_comunicacao        === undefined ||
    data.tipo_identificacao_cnpj_cpf  === undefined
  ) {
    retval.erro = `Erro de argumento (mkDadosDestinatario): todos os dados da linha devem ser informados. ${JSON.stringify(data)}`;
    return retval;
  }

  var campos = [
    formataCampo({
      campo: 'IDENTIFICADOR DE REGISTRO'
      , valor: '312'
      , tipo: N
      , tamanho: 3
      , decimal: 0
    }),

    formataCampo({
      campo: 'RAZÃO SOCIAL'
      , valor: data.razao_social
      , tipo: A
      , tamanho: 40
      , decimal: 0
    }),

    formataCampo({
      campo: 'CNPJ/CPF'
      , valor: data.cnpj_cpf
      , tipo: N
      , tamanho: 14
      , decimal: 0
    }),

    formataCampo({
      campo: 'INSCRIÇÃO ESTADUAL'
      , valor: data.ie
      , tipo: A
      , tamanho: 15
      , decimal: 0
    }),

    formataCampo({
      campo: 'ENDEREÇO'
      , valor: data.endereco
      , tipo: A
      , tamanho: 40
      , decimal: 0
    }),

    formataCampo({
      campo: 'BAIRRO'
      , valor: data.bairro
      , tipo: A
      , tamanho: 20
      , decimal: 0
    }),

    formataCampo({
      campo: 'CIDADE'
      , valor: data.cidade
      , tipo: A
      , tamanho: 35
      , decimal: 0
    }),

    formataCampo({
      campo: 'CEP'
      , valor: data.cep
      , tipo: A
      , tamanho: 9
      , decimal: 0
    }),

    formataCampo({
      campo: 'CÓDIGO DE MUNICÍPIO'
      , valor: data.codigo_de_municipio
      , tipo: A
      , tamanho: 9
      , decimal: 0
    }),

    formataCampo({
      campo: 'ESTADO (2 DIGITOS)'
      , valor: data.estado
      , tipo: A
      , tamanho: 9
      , decimal: 0
    }),

    formataCampo({
      campo: 'ÁREA DE FRETE'
      , valor: data.area_de_frete
      , tipo: A
      , tamanho: 4
      , decimal: 0
    }),

    formataCampo({
      campo: 'NÚMERO DE COMUNICAÇÃO (TELEFONE, FAX, ETC.)'
      , valor: data.numero_de_comunicacao
      , tipo: A
      , tamanho: 35
      , decimal: 0
    }),

    formataCampo({
      campo: 'TIPO DE IDENTIFICAÇÃO DO DESTINATÁRIO (1=CNPJ, 2=CPF)'
      , valor: data.tipo_identificacao_cnpj_cpf
      , tipo: A
      , tamanho: 1
      , decimal: 0
    }),

    formataCampo({
      campo: 'FILLER'
      , valor: ''
      , tipo: A
      , tamanho: 6
      , decimal: 0
    })
  ];

  // Concatena erros e valores para formar a linha
  campos.forEach(campo => {
    if (campo.erro) {
      retval.erro = retval.erro ? retval.erro + campo.erro : campo.erro;
    }
    retval.valor += campo.valor;
  })

  // Apaga o retorno se houver um erro. Não se deve utilizá-lo neste caso.
  if (retval.erro) {
    retval.valor = '';
  }

  return retval;
}



// NOTFIS 3.1
// 000 Cabeçalho intercâmbio x1     =====================
// 310 Cabeçalho documento x200     =====================
// 311 Dados embarcadora x10/310    =====================
// 312 Dados destinatário x500/311  =====================
// 313 Dados NF x40/312
