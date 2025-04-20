///////////////////////////github: omar-bakhsh
function send_handle() {
  const numElement = document.getElementById("number");
  const msgElement = document.getElementById("msg");
  const nameElement = document.getElementById("name");

  if (!numElement || !msgElement || !nameElement) {
    return console.error('One or more required elements are missing in the DOM.');
  }

  const num = numElement.value;
  const msg = msgElement.value;
  const name = nameElement.value;

  window.open(`https://wa.me/${num}?text=I%27m%20api%20msg%20hello%20${name}%20friend%20${msg}`, '_blank');
  return console.log('Menssagem WHATSAPP enviada!');
}