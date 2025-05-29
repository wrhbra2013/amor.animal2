// newsProcessor.js (or any other .js file)
function processNewsItems(model1) {
  let allNewsItems = [];
  if (typeof model1 !== 'undefined' && model1.length > 0) {
    model1.forEach(homeItem => {
      allNewsItems.push({
        type: homeItem.type || 'dynamic',
        id: homeItem.id,
        titulo: homeItem.titulo,
        conteudo: homeItem.mensagem,
        arquivo: homeItem.arquivo,
        link: homeItem.link,
        isExternalLink: !!homeItem.link, // Converts link to boolean
        icon: homeItem.icon,
        linkPath: homeItem.linkPath,
        btnClass: homeItem.btnClass,
        btnText: homeItem.btnText
      });
    });
  }
  return allNewsItems;
}

module.exports = processNewsItems;
