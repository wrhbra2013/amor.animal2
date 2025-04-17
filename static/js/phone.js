/* função telefone */
function phoneFormat(input) { // Returns (##) #####-####
  input = input.replace(/\D/g, '').substring(0, 11); // Strip everything but the first 11 digits
  let size = input.length;
  if (size > 0) input = "(" + input;
  if (size > 2) input = input.slice(0, 3) + ") " + input.slice(3);
  if (size > 7) input = input.slice(0, 10) + " " + input.slice(10);
  return input;
}

