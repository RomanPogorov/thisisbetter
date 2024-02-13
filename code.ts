function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return customBase64Encode(binary);
}

function customBase64Encode(str: string): string {
  const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  do {
    const a = str.charCodeAt(i++);
    const b = str.charCodeAt(i++);
    const c = str.charCodeAt(i++);
    const enc1 = a >> 2;
    const enc2 = ((a & 3) << 4) | (b >> 4);
    let enc3 = ((b & 15) << 2) | (c >> 6);
    let enc4 = c & 63;
    if (isNaN(b)) {
      enc3 = enc4 = 64;
    } else if (isNaN(c)) {
      enc4 = 64;
    }
    result += base64chars.charAt(enc1) + base64chars.charAt(enc2) +
      base64chars.charAt(enc3) + base64chars.charAt(enc4);
  } while (i < str.length);
  return result;
}

async function checkAndExportFrames() {
  const selectedNodes = figma.currentPage.selection.filter(node => node.type === "FRAME");
  if (selectedNodes.length < 2) {
    figma.closePlugin("Должно быть выбрано как минимум 2 фрейма.");
    return;
  }

  const imagesData = await Promise.all(selectedNodes.map(async node => {
    const bytes = await node.exportAsync({ format: "PNG" });
    const base64 = arrayBufferToBase64(bytes);
    return { id: node.id, name: node.name, base64: `data:image/png;base64,${base64}` };
  }));

  figma.showUI(__html__, { width: 400, height: 600 });
  figma.ui.postMessage({ type: 'init', frames: imagesData });
}

checkAndExportFrames();

figma.ui.onmessage = (msg) => {
  if (msg.type === 'send-descriptions') {
    console.log(msg.descriptions);
    figma.closePlugin("Описания успешно отправлены.");
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
