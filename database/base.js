const sql = require('sqlite3').verbose();
const db = new sql.Database("banco.db", erro => {
    if (erro) {
        return console.error(erro.message)
    }
    console.log("Base de Dados ATIVA.");
});

module.exports = {
    db
};

