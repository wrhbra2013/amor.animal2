const {db} = require('./database');

//Adoção
function create_adocao() {
const adocao = `CREATE TABLE IF NOT EXISTS adocao(
    id INTEGER PRIMARY KEY, 
    arquivo blob,
    nome  text,
    idade integer, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato text,     
    whatsapp text,
    origem datetime default (date())
    );`

const sql = db.run(adocao,  error => {
    if (error)  console.log(error)
        console.log('Tabela: Adoção  ATIVA.');
});
return sql
};

create_adocao();

function create_adotante() {
    const  adotante = `CREATE TABLE IF NOT EXISTS adotante (
    id integer PRIMARY KEY,
    origem datetime default (date()),
    q1 integer,
    q2 integer, 
    q3 integer,
    qTotal integer,
    nome text,
    contato text,
    whatsapp text,
    cep text,
    endereco text,
    numero integer,
    complemento text,
    bairro text,
    cidade text,
    estado text,    
    idPet integer NOT NULL,   
    nomePet text NOT NULL,     
    FOREIGN KEY (idPet) REFERENCES adocao (id),
    FOREIGN KEY (nomePet) REFERENCES adocao (nome)
);`
const sql = db.run(adotante,   error => {
    if (error)   console.log(error)
        console.log('Tabela: Adotante ATIVA.');
});
    return  sql

};
create_adotante(); 

function create_adotado(){
    const adotado = ` CREATE TABLE IF NOT EXISTS adotado(
    id integer primary key,
    origem datetime default (date()),
    arquivo blob, 
    pet text,
    tutor text,
    historia text
    );`    
    const sql = db.run(adotado,    error => {
        if (error)   console.log(error)
            console.log('Tabela: Adotado ATIVA.');
    });
    return sql;
};
create_adotado()

//Castração
function create_castracao () {
    const castracao = `CREATE TABLE IF NOT EXISTS castracao(
    id integer PRIMARY KEY,
     origem datetime default (date()),
     ticket integer default (random()),
    nome text,
    contato  text,
    whatsapp text,   
    arquivo blob,
    idade integer,
    especie text, 
    porte text,
    clinica text,
    agenda text
   );`
  const sql = db.run(castracao,   error => {
                if (error)   console.log(error)
                    console.log('Tabela: Castração ATIVA.');
});
return sql
};
create_castracao();

//Procura_se
function create_procura_se(){
      const procurase = `CREATE TABLE IF NOT EXISTS procura_se (
        id INTEGER PRIMARY KEY,
         origem datetime default (date()),
         arquivo blob,
         nomePet text,
         idadePet integer,
         especie text,
         porte text,
         caracteristicas text,
         local text,
         tutor text,
         contato text,
         whatsapp text
        );`
    const sql = db.run(procurase,   error => {
        if (error)   console.log(error)
            console.log('Tabela: Procura-se ATIVA.');
});
    return sql;
};
create_procura_se();

//Parceria
function create_parceria(){
  const parceria =` CREATE TABLE IF NOT EXISTS parceria(
   id INTEGER PRIMARY KEY,
   origem datetime default (date()),
    empresa text,
    localidade text,
    proposta text,
    representante text,
    telefone text,
    whatsapp text,
    email text
     );`
    const sql = db.run(parceria,   error => {
        if (error)   console.log(error)
            console.log('Tabela: Parceria ATIVA.');
});
    return sql;
};
create_parceria();


function create_home(){
    const home = `CREATE TABLE IF NOT EXISTS home(
        id INTEGER PRIMARY KEY,
        origem datetime default (date()),
        arquivo blob, 
        titulo text,
        mensagem text,
        link text
    );`
    const sql = db.run(home,   error => {   
        if (error)   console.log(error)
            console.log('Tabela: Home ATIVA.');     
    });
       return sql;
}
create_home();

function create_login() {
    const createTableSql = `CREATE TABLE IF NOT EXISTS login(
        id INTEGER PRIMARY KEY,
        origem DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
        usuario TEXT UNIQUE NOT NULL, -- Adicionado UNIQUE NOT NULL
        senha TEXT NOT NULL          -- Adicionado NOT NULL
    );`;

    // 1. Cria a tabela (se não existir)
    db.run(createTableSql, error => {
        if (error) {
            console.error('Erro ao criar/verificar tabela login:', error);
            return; // Para a execução se a tabela não puder ser criada/verificada
        }
        console.log('Tabela: Login ATIVA.');

        // 2. Verifica se o usuário admin padrão já existe
        const checkUserSql = `SELECT id FROM login WHERE usuario = ?;`;
        const defaultUser = '@admin';
        // !!! NUNCA armazene senhas em texto plano em produção !!!
        // Use bcrypt.hashSync(senha, saltRounds) para gerar o hash ao criar
        const defaultPass = '@amoranimal2025'; // Substitua por um HASH de senha real

        db.get(checkUserSql, [defaultUser], (err, row) => {
            if (err) {
                console.error('Erro ao verificar usuário admin:', err);
                return;
            }

            // 3. Se o usuário NÃO existir (row é undefined/null), insere o padrão
            if (!row) {
                console.log(`Usuário '${defaultUser}' não encontrado, criando...`);
                const insertSql = `INSERT INTO login (usuario, senha) VALUES (?, ?);`;

                // Se estivesse usando bcrypt:
                // bcrypt.hash(defaultPass, saltRounds, (hashErr, hashedPassword) => {
                //    if(hashErr) { console.error("Erro ao gerar hash:", hashErr); return; }
                //    db.run(insertSql, [defaultUser, hashedPassword], insertErr => { ... });
                // });

                // Sem bcrypt (NÃO RECOMENDADO PARA PRODUÇÃO):
                db.run(insertSql, [defaultUser, defaultPass], insertErr => {
                    if (insertErr) {
                        // Pode dar erro se outro processo inseriu entre o GET e o RUN (raro, mas possível)
                        // ou se houver outra violação de constraint.
                        console.error('Erro ao inserir usuário admin padrão:', insertErr);
                    } else {
                        console.log(`Usuário admin padrão '${defaultUser}' CRIADO.`);
                    }
                });
            } else {
                // Opcional: Logar que o usuário já existe
                console.log(`Usuário admin padrão '${defaultUser}' já existe.`);
            }
        });
    });
    // db.run é assíncrono, retornar algo aqui não reflete a conclusão das operações no DB.
    // A função em si não precisa retornar nada.
}

// Chama a função para garantir que a tabela e o usuário existam
create_login();



module.exports ={
    create_adocao: create_adocao,
    create_adotante: create_adotante,
    create_adotado: create_adotado,
    create_castracao: create_castracao,
    create_procura_se: create_procura_se,
    create_parceria: create_parceria,
     create_home: create_home
}

