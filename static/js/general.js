function preview() {
    frame.src = URL.createObjectURL(event.target.files[0]);
}

function clearImage() {
    document.getElementById('arquivo').value = null;
    frame.src = "";
}

function phoneFormat(phone) {
    return phone.replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{4})\d+?$/, '$1');
}

