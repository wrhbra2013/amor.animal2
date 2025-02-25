const {insert_adocao} = require('./insert');
const prompt = require("prompt-sync")();

let arquivo =  prompt("arquivo Digite => "); 
let nome =  prompt("nome Digite => ");
let idade =  prompt("idade Digite => ");
let especie =  prompt("especie Digite => ");
let porte =  prompt("porte Digite => ");
let caracteristicas =  prompt("caracteristicas Digite => ");
let tutor =  prompt("tutor Digite => ");
let contato =  prompt("contato Digite => ");
insert_adocao(arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato, 
    error => { 
        if (error) return console.log(error)
            console.log('Teste registrado com sucesso')
    }
); 