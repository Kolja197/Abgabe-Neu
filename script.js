/* Routing */
window.addEventListener("load", () => {
    /**
     * Hilfsfunktion zum Umschalten des sichtbaren Inhalts
     *
     * @param {String} id HTML-ID des anzuzeigenden <main>-Elements
     * @param {String} title Neuer Titel für den Browser-Tab
     */
    let swapContent = (id, title) => {
        document.querySelectorAll("main").forEach(mainElement => {
            mainElement.classList.add("hidden");
        })

        let element = document.querySelector(`#${id}`);
        if (element) element.classList.remove("hidden");

        document.title = `${title} | Koljas API`;
    }

    /**
     * Konfiguration des URL-Routers
     */
    let routes = [
        {
            url: "^/$",
            show: () => { apiSuchePersonen();
                swapContent("startansicht", "Startseite");
            },
        },{
            url: "^/users/[0-9]+$",
            show: () => { apiSucheBlockposts();
                swapContent("zweiteseite", "Detailansicht");
               }  
            }
    ];

    let router = new Router(routes);
    router.start();
});





/* Funktion für die erste Kundenansicht*/
function apiSuchePersonen(){
    console.log("Startseite geladen!");
    let suchbegriff = document.getElementById('suchleiste');
    let textfeld = document.getElementById('textfeld');
    let suchButton = document.getElementById('apiSucheStarten');

    // Starten der Suche beim Drücken von Enter
    suchbegriff.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            starteSuche();
        }
    });

    // Starten der Suche beim Klicken des Such-Buttons
    suchButton.addEventListener('click', starteSuche);

    /* Sowohl durch Klicken als auch durch das Drücken von Enter wird die Funktion starteSuche() ausgeführt.
       Hier wird der Text im Eingabefeld "Suchbegriff" einer Variable übergeben und der API-Abfrage hinzugefügt. */

    function starteSuche() {
        console.log("Suche durchgeführt!");
        let eingabe =  ersterBuchstabeInCaps(suchbegriff.value.trim());
        console.log(eingabe);

        fetch(`https://dummyjson.com/users/filter?key=address.city&value=${eingabe}`)
        .then(response => {
            if(!response.ok) {
                throw new Error('HTTP-Fehler, Status:' + response.status);     
            }
            return response.json();
        })
        .then(data => {
            let personen = data.users;

            if(personen.length > 0){

                let container = ``;
                
                // Ersetzte HTML-Inhalt des div-Containers "textfeld" durch die einzelnen Personen
                personen.forEach(person => {
                    container += `<div class="kunden-container"><button class="person" data-id="${person.id}" id="personenauswahl">${person.firstName} ${person.lastName}</button></div>`;
                })
                textfeld.innerHTML = container;
            }
            
            else{
                textfeld.textContent = 'Ich konnte keine Person aus der Stadt "' + eingabe + '" finden';
            }
        })
        .catch(error => {
            console.error('Fehler bei der API-Anfrage', error);
            textfeld.textContent = 'Der von Ihnen gewählte Suchbegriff weist keine Ergebnisse auf.';
        });
    }

    /* Eventlistener, bei dem Klicken auf die Kurzansicht einer Person wird neue URL aufgerufen */
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('person')) {
            
            let selectedUserId = event.target.dataset.id;

            let currentURL = window.location.href;
            let newURL = currentURL + '#/users/' + selectedUserId;
            window.location.href = newURL; 
        }
    });
}

/* Funktion für die Detailansicht, sowie die Blockposts eines Users */
function apiSucheBlockposts(){
    console.log("Detailansicht geladen!");
    let personendaten = document.querySelector('#zweiteseite .personendaten');
    let personenblockposts = document.querySelector('#zweiteseite .personenblockposts');

    /* Extrahieren der UserId aus der URL */
    let url = window.location.href;
    let teile = url.split('/');
    let userId = teile[teile.length - 1];
    console.log(userId);
    
    starteDetailsuche();
    starteBlockPostsuche();
    
    function starteDetailsuche(){
        console.log("Detailsuche wird durchgefüht");
    
        fetch(`https://dummyjson.com/users/${userId}`)
        .then(response => {
            if(!response.ok) {
                throw new Error('HTTP-Fehler, Status:' + response.status);     
            }
            return response.json();
        })
        .then(data => {
            let person = data;
                    personContainer =  `<div class="profilbild_container">
                                            <img class="profilbild_img "src="${person.image}" alt="Profilbild">
                                        </div>
                                        <div class="usercard">
                                            <div class="usercard-content">
                                                <div>
                                                    <span class="label">Name:</span>
                                                    <span>${person.firstName} ${person.lastName}</span>
                                                </div>
                                                <div>
                                                     <span class="label">Alter:</span>
                                                     <span>${person.age}</span>
                                                 </div>
                                                <div>
                                                    <span class="label">Beruf:</span>
                                                    <span>${person.company.title}</span>
                                                </div>
                                                <div>
                                                    <span class="label">Email:</span>
                                                    <span>${person.email}</span>
                                                </div>
                                                <div>
                                                    <span class="label">Telefonnummer:</span>
                                                    <span>${person.phone}</span>
                                                </div>
                                        </div>`;
                personendaten.innerHTML = personContainer;
        })
   }

    function starteBlockPostsuche(){
    console.log("Blockpostsuche wird durchgeführt");

    fetch(`https://dummyjson.com/posts/user/${userId}`)
    .then(response => {
        if(!response.ok) {
            throw new Error('HTTP-Fehler, Status:' + response.status);     
        }
        return response.json();
    })
    .then(data => {
        let userpost = data.posts;


            let postContainer = ``;
            let ueberschrift = `<h3 class="blockpost">Blockposts</h3>`;
            
            // Ersetzte HTML-Inhalt des div-Containers "textfeld" durch die einzelnen Personen
            if(userpost.length > 0){
                userpost.forEach(userpost => {
                    postContainer += `<div class="userpost">
                                        <h4>${userpost.title}</h4>
                                        <p>${userpost.body}</p>
                                      </div>`;
                })
                personenblockposts.innerHTML = ueberschrift + postContainer;
            }

            else{
                let noposts = `<div class="noposts">Der User hat noch nichts gepostet</div>`
                personenblockposts.innerHTML = ueberschrift + noposts;
            }

    
        
    })
}
} 





