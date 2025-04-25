document.getElementById('whatsapp').addEventListener('change', function() {
    if (this.value === 'sim') {
      const phoneInput = document.getElementById('phone').value;
      const message = encodeURIComponent("Olá, esta é uma mensaagem automática da ONG Amor Animal.");
      if (phoneInput) {
        const whatsappUrl = `https://wa.me/${phoneInput.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      } else {
        alert('Por favor, preencha o número de telefone antes de selecionar esta opção.');
          }
      };
    
      });
    