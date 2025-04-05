const { 
    adocao, 
    adotante,
    adotado,
    castracao,
    parceria,
    procura_se,
    doacao
    } = require('./database/create.js');
    const { 
    insert_adocao, 
    insert_adotante,
    insert_adotado,
    insert_castracao,
    insert_parceria,
    insert_procura_se,
    insert_doacao
    } = require('./database/insert.js');
    
const prompt = require("prompt-sync")();

/* function adocao(){
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
};
adocao() */
function teste_adotado(){
    /* const insert = `INSERT INTO adotado (
        origem,
        arquivo,
        nomePet,
        nomeTutor,
        historia
        ) 
        VALUES (strftime('%d/%m/%Y'), ?, ?, ?, ?
        );` */
        const form =  [
             origem = prompt('Digite uma data...'),
             arquivo = prompt('Digite arquivo...'),
             pet = prompt('Digite no nome do pet...'),
             tutor = prompt('Digite o nomedo tutor...'),
             historia = prompt('Cite uma frase...')
        ];
        const sql = db.run(insert_adotado(form[origem], form[arquivo, form[pet], form[tutor],form[historia]]), error =>{
            if (error) return console.log(error)
                console.log('Registrado com sucesso');
        });
   
        return sql;
};
teste_adotado()

module.exports = {
    teste_adotado: teste_adotado
}


