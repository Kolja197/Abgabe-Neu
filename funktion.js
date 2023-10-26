/* Suchfunktion */
function apiSuche(){
    var suchbegriff = document.getElementById("suchleiste").value;
    var textfeld = document.getElementById("textfeld");

    fetch('https://dummyjson.com/products')
        .then(response => {
            if(!response.ok) {
                throw new Error('HTTP-Fehler, Status:' + response.status);     
            }
            return response.json();
        })
        .then(data => {
            textfeld.textContent = 'Das Ergebnis Ihrer Suchanfrage: ' + JSON.stringify(data);
        })
        .catch(error => {
            console.error('Fehler bei der API-Anfrage', error);
            textfeld.textContent = 'Der von Ihnen gewählte Suchbegriff weißt keine Ergebnisse auf.';
        });
}


