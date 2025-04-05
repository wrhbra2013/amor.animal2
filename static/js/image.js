/* funçao foto */
function preview() {
  frame.src=URL.createObjectURL(event.target.files[0]);
};


/* função telefone */
function phoneFormat(input) {//returns (###) ###-####
  input = input.replace(/\D/g,'').substring(0,11); //Strip everything but 1st 10 digits
  let size = input.length;
  if (size>0) {input="("+input}
  if (size>3) {input=input.slice(0,3)+") "+input.slice(3)}
  if (size>4) {input=input.slice(0,10)+"-" +input.slice(10)}
  return input;
};

document.getElementsByClassName("btncustom").disabled = true;