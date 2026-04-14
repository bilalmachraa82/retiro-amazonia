/**
 * ═══════════════════════════════════════════════════════
 * Google Apps Script — Retiro Ascensão Amazônia
 * Lead Capture + Email Notification
 * ═══════════════════════════════════════════════════════
 *
 * INSTRUÇÕES DE INSTALAÇÃO:
 *
 * 1. Cria um Google Sheet novo (ex: "Retiro Amazônia — Inscrições")
 * 2. Na primeira linha (cabeçalho), escreve:
 *    A1: Data/Hora | B1: Nome | C1: Email | D1: Telefone
 *    E1: Cidade | F1: Nascimento | G1: Interesse | H1: Origem
 *
 * 3. Vai a Extensões > Apps Script
 * 4. Apaga o conteúdo e cola TODO este ficheiro
 * 5. Altera o EMAIL_NOTIFICACAO abaixo para o email da Rosana
 * 6. Clica em "Implantar" > "Nova implantação"
 *    - Tipo: "App da web"
 *    - Executar como: "Eu" (a tua conta)
 *    - Quem tem acesso: "Qualquer pessoa"
 * 7. Copia o URL da implantação
 * 8. Cola esse URL no index.html onde diz GOOGLE_SCRIPT_URL
 *
 * Depois de colar o URL no site e fazer deploy, TESTA:
 * - Preenche o formulário no site
 * - Verifica se aparece na Sheet
 * - Verifica se o email chega
 */

// ══════ CONFIGURAÇÃO ══════
var EMAIL_NOTIFICACAO = 'rosanakalil@email.com'; // ← ALTERAR para o email real da Rosana
var NOME_SHEET = 'Sheet1'; // Nome da aba (por defeito é "Sheet1" ou "Folha1" em PT)

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_SHEET);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    }

    var timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    sheet.appendRow([
      timestamp,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.cidade || '',
      data.nascimento || '',
      data.interest || '',
      data.source || 'site'
    ]);

    // Enviar email de notificação
    if (EMAIL_NOTIFICACAO && data.name && data.email) {
      var subject = '🌿 Nova Inscrição — Retiro Amazônia: ' + data.name;
      var body = 'Nova inscrição recebida!\n\n'
        + 'Nome: ' + (data.name || '-') + '\n'
        + 'Email: ' + (data.email || '-') + '\n'
        + 'Telefone: ' + (data.phone || '-') + '\n'
        + 'Cidade: ' + (data.cidade || '-') + '\n'
        + 'Nascimento: ' + (data.nascimento || '-') + '\n'
        + 'Interesse: ' + (data.interest || '-') + '\n'
        + 'Origem: ' + (data.source || '-') + '\n\n'
        + 'Acesse a planilha para ver todas as inscrições.';

      MailApp.sendEmail(EMAIL_NOTIFICACAO, subject, body);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Responder a GET (para testar no browser)
function doGet() {
  return ContentService
    .createTextOutput('Retiro Amazônia Lead API — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
