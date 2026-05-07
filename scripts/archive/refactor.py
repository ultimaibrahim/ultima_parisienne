import re

with open('Code.gs', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Add CONSOLIDADO to TAB
content = content.replace('SUCURSALES: "Sucursales"', 'SUCURSALES: "Sucursales",\n  CONSOLIDADO: "Consolidado"')

# Add CONSOLIDADO to setupHojaInicial
content = content.replace('["id","nombre","encargado","correo","drive_url","activa"],', '["id","nombre","encargado","correo","drive_url","activa"],\n    [TAB.CONSOLIDADO]: ["semana","nombre","meta","venta","acumulado","trx","entrego"]')

# Replace getConsolidado and saveConsolidado
content = content.replace('const ss = getSheet(TAB.SUCURSALES);', 'const ss = getSheet(TAB.CONSOLIDADO);')
content = content.replace('const rows = sheetData(TAB.SUCURSALES);', 'const rows = sheetData(TAB.CONSOLIDADO);')

# Replace uploadFile
new_upload = '''function uploadFile(payload) {
  if (!DRIVE_FOLDER_ID) {
    throw new Error("El sistema no tiene configurado el ID de Drive (DRIVE_FOLDER_ID en Code.gs).");
  }

  const base64Data = payload.fileData.split(',')[1]; 
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), payload.mimeType, payload.fileName);
  
  const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folders = mainFolder.getFoldersByName(payload.sucursal);
  const sucFolder = folders.hasNext() ? folders.next() : mainFolder.createFolder(payload.sucursal);
  
  let file;
  let isImage = payload.mimeType.startsWith('image/');
  let metaStr = 0;
  let venta = 0;
  let acumulado = 0;
  let trx = 0;
  let extracted = false;

  try {
    if (isImage) {
      const resource = {
        title: payload.fileName,
        mimeType: MimeType.GOOGLE_DOCS,
        parents: [{ id: sucFolder.getId() }]
      };
      file = Drive.Files.insert(resource, blob, { ocr: true });
      Utilities.sleep(2000);
      try {
        const doc = DocumentApp.openById(file.id);
        const text = doc.getBody().getText();
        const nums = text.replace(/[^0-9.]/g, ' ').split(/\\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (nums.length > 0) {
          metaStr = Math.max(...nums);
          extracted = true;
        }
      } catch(e) {}
    } else {
      const resource = {
        title: payload.fileName,
        mimeType: MimeType.GOOGLE_SHEETS,
        parents: [{ id: sucFolder.getId() }]
      };
      file = Drive.Files.insert(resource, blob, { convert: true });
      Utilities.sleep(3000);
      try {
        const ssExcel = SpreadsheetApp.openById(file.id);
        const sheetExcel = ssExcel.getSheets()[0];
        venta = parseFloat(sheetExcel.getRange("D8").getValue()) || 0;
        acumulado = parseFloat(sheetExcel.getRange("D9").getValue()) || 0;
        trx = parseFloat(sheetExcel.getRange("D10").getValue()) || 0;
        extracted = true;
      } catch(e) {
        Logger.log("Error extrayendo celdas: " + e.message);
      }
    }

    if (extracted && payload.semana && payload.sucursal) {
      const ss = getSheet(TAB.CONSOLIDADO);
      if (ss) {
        const allData = ss.getDataRange().getValues();
        let rowIndex = -1;
        for(let i=1; i<allData.length; i++){
          if(allData[i][0] === payload.semana && allData[i][1] === payload.sucursal) { rowIndex = i + 1; break; }
        }
        
        if(rowIndex > 0) {
          if (isImage) ss.getRange(rowIndex, 3).setValue(metaStr);
          else {
            ss.getRange(rowIndex, 4).setValue(venta);
            ss.getRange(rowIndex, 5).setValue(acumulado);
            ss.getRange(rowIndex, 6).setValue(trx);
            ss.getRange(rowIndex, 7).setValue(true); // entrego = true
          }
        } else {
          ss.appendRow([
            payload.semana, 
            payload.sucursal, 
            isImage ? metaStr : 0, 
            isImage ? 0 : venta, 
            isImage ? 0 : acumulado, 
            isImage ? 0 : trx, 
            isImage ? false : true
          ]);
        }
      }
    }
  } catch (err) {
    const fallbackFile = sucFolder.createFile(blob);
    return { 
      ok: true, 
      fileId: fallbackFile.getId(), 
      url: fallbackFile.getUrl(),
      warning: "Error en auto-consolidacion: " + err.message
    };
  }

  return {
    ok: true,
    fileId: file.id,
    url: file.alternateLink
  };
}'''

start_idx = content.find('function uploadFile(payload) {')
end_idx = content.find('\n// ----------------------------------------------------------------\n//  CONSOLIDADO')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_upload + content[end_idx:]
else:
    print("Could not find uploadFile block boundaries")

with open('Code.gs', 'w', encoding='utf-8') as f:
    f.write(content)
