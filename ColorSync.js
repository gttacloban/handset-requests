/**
 * Handset Pre-Order Tracker – shared color-suggestion visibility.
 * Add this as a NEW .gs file inside the EXISTING Google Apps Script project.
 * Do not replace your working Code.gs. See BACKEND_INSTALL.txt to connect
 * these helpers to the already authenticated doPost(action) dispatcher.
 *
 * Important: the 'verifiedUser' argument MUST come from your backend's
 * Google ID token verification + Users/roles lookup, never from JSON input.
 * Hidden colors affect autocomplete choices only, NOT saved Requests.
 */
const HPO_HIDDEN_COLORS_PROPERTY = 'HPO_SHARED_HIDDEN_COLORS_V1';

function hpoNormalizeColor_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hpoReadColorSettings_() {
  const raw = PropertiesService.getScriptProperties().getProperty(HPO_HIDDEN_COLORS_PROPERTY);
  let values = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) values = parsed;
    } catch (e) {
      throw new Error('Shared color settings are invalid. Ask the administrator to repair them.');
    }
  }
  const hiddenColors = [...new Set(values.filter(v => typeof v === 'string').map(hpoNormalizeColor_).filter(Boolean))];
  return { hiddenColors: hiddenColors };
}

// Call only AFTER your normal backend authentication and allowlist check.
function hpoUpdateColorSettings_(body, verifiedUser) {
  if (!verifiedUser || verifiedUser.admin !== true) {
    throw new Error('Only a verified Admin may change shared color suggestions.');
  }
  const mode = String((body && body.mode) || '');
  if (!['hide', 'show', 'hideAll', 'showAll'].includes(mode)) {
    throw new Error('Unsupported color management action.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const settings = hpoReadColorSettings_();
    const hidden = new Set(settings.hiddenColors);
    if (mode === 'showAll') {
      hidden.clear();
    } else if (mode === 'hideAll') {
      // Get all unique colors from the SAME existing Requests sheet.
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requests');
      if (!sheet) throw new Error('Requests sheet not found.');
      const lastRow = sheet.getLastRow();
      const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const column = header.findIndex(h => ['exact color', 'color'].includes(String(h).trim().toLowerCase())) + 1;
      if (!column) throw new Error('Exact Color column not found in Requests sheet.');
      if (lastRow > 1) {
        const colors = sheet.getRange(2, column, lastRow - 1, 1).getDisplayValues();
        colors.forEach(row => {
          const name = hpoNormalizeColor_(row[0]);
          if (name) hidden.add(name);
        });
      }
    } else {
      const color = hpoNormalizeColor_(body.color);
      if (!color || color.length > 100) throw new Error('Invalid color name.');
      if (mode === 'hide') hidden.add(color);
      else hidden.delete(color);
    }
    // ScriptProperties is shared across ALL signed-in users of this deployment.
    const newList = [...hidden].sort();
    PropertiesService.getScriptProperties().setProperty(HPO_HIDDEN_COLORS_PROPERTY, JSON.stringify(newList));
    return { hiddenColors: newList };
  } finally {
    lock.releaseLock();
  }
}
