/**
 * Handset Pre-Order Tracker — shared team announcements.
 * Add this as a NEW Apps Script file to the currently deployed project.
 * Does not replace Code.gs or ColorSync.gs.
 *
 * API actions to add to the EXISTING authenticated doPost action dispatcher:
 *   getUpdates    -> hpoReadUpdates_()
 *   manageUpdate  -> hpoManageUpdate_(body, verifiedUser)
 *
 * IMPORTANT: verifiedUser MUST be determined by the SERVER after checking the
 * Google idToken and authorized user's role. NEVER use a role sent by the client.
 */
const HPO_UPDATES_SHEET = 'TeamUpdates';
const HPO_UPDATES_HEADERS = ['ID', 'Category', 'Title', 'Message', 'Created At', 'Updated At', 'Author'];

function hpoUpdatesSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('This Apps Script must be bound to the tracker spreadsheet.');
  let sheet = book.getSheetByName(HPO_UPDATES_SHEET);
  if (!sheet) {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      sheet = book.getSheetByName(HPO_UPDATES_SHEET);
      if (!sheet) {
        sheet = book.insertSheet(HPO_UPDATES_SHEET);
        sheet.getRange(1, 1, 1, HPO_UPDATES_HEADERS.length).setValues([HPO_UPDATES_HEADERS]);
        sheet.getRange(1, 1, 1, HPO_UPDATES_HEADERS.length)
          .setFontWeight('bold').setBackground('#0b1f4d').setFontColor('#ffffff');
        sheet.setFrozenRows(1);
        sheet.getRange('A:G').setNumberFormat('@');
      }
    } finally { lock.releaseLock(); }
  }
  return sheet;
}

function hpoUpdatesSafeText_(s) {
  const value = String(s || '');
  // Prevent an authored announcement from being evaluated as a spreadsheet formula.
  return /^[=+@-]/.test(value) ? "'" + value : value;
}

function hpoReadUpdates_() {
  const sheet = hpoUpdatesSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return { updates: [] };
  const rows = sheet.getRange(2, 1, last - 1, 7).getDisplayValues();
  const updates = rows.filter(r => r[0]).map(r => ({
    id: r[0], type: r[1], title: r[2], message: r[3],
    createdAt: r[4], updatedAt: r[5], author: r[6]
  })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return { updates: updates.slice(0, 100) };
}

function hpoManageUpdate_(body, verifiedUser) {
  if (!verifiedUser || verifiedUser.admin !== true) {
    throw new Error('Only a verified Admin can publish, edit, or delete updates.');
  }
  const mode = String((body && body.mode) || '');
  if (mode !== 'save' && mode !== 'delete') throw new Error('Invalid updates action.');
  // Ensure the sheet exists BEFORE taking the write lock, to avoid nested locks
  // during the first publish.
  const sheet = hpoUpdatesSheet_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const last = sheet.getLastRow();
    const records = last > 1 ? sheet.getRange(2, 1, last - 1, 7).getDisplayValues() : [];
    const recordId = mode === 'delete' ? String(body.id || '') : String((body.update && body.update.id) || '');
    const recordIndex = records.findIndex(r => r[0] === recordId);
    if (mode === 'delete') {
      if (!recordId || recordIndex < 0) throw new Error('Update not found. Reload and try again.');
      sheet.deleteRow(recordIndex + 2);
    } else {
      const u = body.update || {};
      const type = String(u.type || '');
      const title = String(u.title || '').trim();
      const message = String(u.message || '').trim();
      if (!['Announcement','Change','Notification'].includes(type)) throw new Error('Invalid update category.');
      if (!title || title.length > 120) throw new Error('Update title must be 1–120 characters.');
      if (!message || message.length > 1200) throw new Error('Update message must be 1–1200 characters.');
      if (recordId && recordIndex < 0) throw new Error('Update not found. Reload and try again.');
      const now = new Date().toISOString();
      const author = String(verifiedUser.name || verifiedUser.email || 'Admin');
      const row = [
        recordId || 'UPD-' + Utilities.getUuid(),
        type, hpoUpdatesSafeText_(title), hpoUpdatesSafeText_(message),
        recordIndex < 0 ? now : records[recordIndex][4], now,
        recordIndex < 0 ? hpoUpdatesSafeText_(author) : records[recordIndex][6]
      ];
      if (recordIndex >= 0) sheet.getRange(recordIndex + 2, 1, 1, 7).setValues([row]);
      else sheet.appendRow(row);
    }
    return hpoReadUpdates_();
  } finally { lock.releaseLock(); }
}
