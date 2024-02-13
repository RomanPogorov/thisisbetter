// Основной скрипт плагина
function checkSelectedFrames() {
  const selectedNodes = figma.currentPage.selection;
  if (selectedNodes.length < 2 || !selectedNodes.every(node => node.type === "FRAME" && node.width === 800 && node.height === 800)) {
    figma.closePlugin("Все выбранные фреймы должны иметь размер 800 на 800 px, и должно быть выбрано как минимум 2 фрейма.");
    return false;
  }
  return true;
}

if (checkSelectedFrames()) {
  const selectedFrames = figma.currentPage.selection.filter(node => node.type === "FRAME");
  const frameData = selectedFrames.map(frame => ({
    id: frame.id,
    name: frame.name,
    description: `Описание для ${frame.name}`
  }));

  figma.showUI(__html__, { width: 400, height: 300 });
  figma.ui.postMessage({ type: 'init', frames: frameData });

  figma.ui.onmessage = msg => {
    if (msg.type === 'send-descriptions') {
      // Здесь можно добавить обработку отправленных описаний
      console.log(msg.descriptions);
      figma.closePlugin("Описания успешно отправлены.");
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    }
  };
} else {
  // Проверка не прошла, UI не показываем
}
