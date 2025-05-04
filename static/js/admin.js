function confirmDelete(ticket, arquivo) {
    if (confirm('Tem certeza de que deseja excluir esta castração? Ticket: ' + ticket)) {
        // Use fetch to send a POST request for deletion
        fetch(`/delete/castracao/${ticket}/${arquivo}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Add CSRF token header if you implement CSRF protection
            }
        })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Reload the page on success
            } else {
                alert('Erro ao excluir o registro.'); // Show error message
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
            alert('Erro ao tentar excluir.');
        });
    }
}
confirmDelete(ticket, arquivo) 
