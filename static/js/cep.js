
// function limpa_formulário_cep() {
//     //Limpa valores do formulário de cep.
//     document.getElementById('endereco').value=("");
//     document.getElementById('bairro').value=("");
//     document.getElementById('cidade').value=("");
//     document.getElementById('estado').value=("");
//     document.getElementById('ibge').value=("");
// }

// function meu_callback(conteudo) {
// if (!("erro" in conteudo)) {
//     //Atualiza os campos com os valores.
//     document.getElementById('endereco').value=(conteudo.logradouro);
//     document.getElementById('bairro').value=(conteudo.bairro);
//     document.getElementById('cidade').value=(conteudo.localidade);
//     document.getElementById('estado').value=(conteudo.uf);
//     document.getElementById('ibge').value=(conteudo.ibge);
// } //end if.
// else {
//     //CEP não Encontrado.
//     limpa_formulário_cep();
//     alert("CEP não encontrado.");
// }
// }

// function pesquisacep(valor) {

// //Nova variável "cep" somente com dígitos.
// var cep = valor.replace(/\D/g, '');

// //Verifica se campo cep possui valor informado.
// if (cep != "") {

//     //Expressão regular para validar o CEP.
//     var validacep = /^[0-9]{8}$/;

//     //Valida o formato do CEP.
//     if(validacep.test(cep)) {

//         //Preenche os campos com "..." enquanto consulta webservice.
//         document.getElementById('endereco').value="...";
//         document.getElementById('bairro').value="...";
//         document.getElementById('cidade').value="...";
//         document.getElementById('estado').value="...";
//         document.getElementById('ibge').value="...";

//         //Cria um elemento javascript.
//         var script = document.createElement('script');

//         //Sincroniza com o callback.
//         script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';

//         //Insere script no documento e carrega o conteúdo.
//         document.body.appendChild(script);

//     } //end if.
//     else {
//         //cep é inválido.
//         limpa_formulário_cep();
//         alert("Formato de CEP inválido.");
//     }
// } //end if.
// else {
//     //cep sem valor, limpa formulário.
//     limpa_formulário_cep();
// }
// };
(function cepAPI() {
    const cep = document.querySelector("input[name=cep]");

    if (cep) { // Check if the element exists
        cep.addEventListener('blur', e => {
            const value = cep.value.replace(/[^0-9]+/, '');
            const url = `https://viacep.com.br/ws/${value}/json/`;

            fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (json.logradouro) {
                        document.querySelector('input[name=endereco]').value = json.logradouro;
                        document.querySelector('input[name=bairro]').value = json.bairro;
                        document.querySelector('input[name=cidade]').value = json.localidade;
                        document.querySelector('input[name=estado]').value = json.uf;
                    }
                });
        });
    }
})
();
