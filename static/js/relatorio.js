document.addEventListener('DOMContentLoaded', function() {
    const tabelaSelector = document.getElementById('tabela'); // Usando o ID existente 'tabela'
    if (tabelaSelector) {
        tabelaSelector.addEventListener('change', function() {
            const selectedTable = this.value;
            if (selectedTable) {
                // Redireciona para a URL do relatório da tabela selecionada
                window.location.href = '/relatorio/' + selectedTable;
            } else {
                // Se "-- Escolha uma tabela --" for selecionado, pode redirecionar para uma página base
                window.location.href = '/relatorio'; // Ou limpar a visualização atual
            }
        });
    }
});