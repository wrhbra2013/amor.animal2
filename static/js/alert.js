const links = ['./static/uploads/nina.jpeg'];

for (link in links) {
  document.getElementById('slides').innerHTML += `<div>
  <a href=${link}>
  <img src=${link} alt="pets" style="width=120" />
  </a>
  </div>`;
}

