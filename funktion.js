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

    /* Extrahieren der UserId aus der URL */
    let url = window.location.href;
    let teile = url.split('/');
    let userId = teile[teile.length - 1];
    console.log(userId);
    
    starteDetailsuche();
    
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
} 


/* Diese Funktion soll ermöglichen, dass ein Suchbegriff unabhänig von Groß- und Kleinschreibung auf Ergebnisse trifft */ 
function ersterBuchstabeInCaps(wort){
    if(wort.length == 0){
        return wort;
    }

    return wort.charAt(0).toUpperCase() + wort.slice(1).toLowerCase();
}



"use strict";

/**
 * Diese Klasse stellt einen so genannten Single Page Router dar. Sie überwacht
 * die momentan aktive URL (die sich durch Anklicken eines Links oder durch
 * Setzen von window.location.href in JavaScript jederzeit ändern kann) und
 * sorgt dafür, dass der für die jeweilige URL richtige Inhalt angezeigt wird.
 *
 * Hierzu muss der Klasse bei ihrer Instantiierung eine Liste mit Routen
 * mitgegeben werden, die jeweils einen regulären Ausdrück zur Prüfung der
 * URL sowie eine Funktion zur Anzeige des dazugehörigen Inhalts besitzen.
 */
class Router {
    /**
     * Konstruktor. Im Parameter routes muss eine Liste mit den vorhandenen
     * URL-Routen der App übergeben werden. Die Liste muss folgendes Format
     * haben:
     *
     *      [
     *          {
     *              url: "^/$"              // Regulärer Ausdruck zur URL
     *              show: matches => {...}  // Funktion zur Anzeige des Inhalts
     *          }, {
     *              url: "^/Details/(.*)$"  // Regulärer Ausdruck zur URL
     *              show: matches => {...}  // Funktion zur Anzeige des Inhalts
     *          },
     *          ...
     *      ]
     *
     * @param {List} routes Definition der in der App verfügbaren Seiten
     */
    constructor(routes) {
        this._routes = routes;
        this._started = false;

        window.addEventListener("hashchange", () => this._handleRouting());
    }

    /**
     * Routing starten und erste Route direkt aufrufen.
     */
    start() {
        this._started = true;
        this._handleRouting();
    }

    /**
     * Routing stoppen, so dass der Router nicht mehr aktiv wird, wenn Link
     * angeklickt wird oder sich die URL der Seite sonst irgendwie ändert.
     */
    stop() {
        this._started = false;
    }

    /**
     * Diese Methode wertet die aktuelle URL aus und sorgt dafür, dass der
     * dazu passende Inhalt angezeigt wird. Der Einfachheit halber wird eine
     * so genannte Hash-URL verwendet, bei der die aufzurufende Seite nach
     * einem #-Zeichen stehen muss. Zum Beispiel:
     *
     *   http://localhost:8080/index.html#/Detail/1234
     *
     * Hier beschreibt "/Detail/1234" den Teil der URL mit der darzustellenden
     * Seite. Der Vorteil dieser Technik besteht darin, dass ein Link mit einer
     * solchen URL keine neue Seite vom Server lädt, wenn sich der vordere Teil
     * der URL (alles vor dem #-Zeichen) nicht verändert. Stattdessen wird
     * ein "hashchange"-Ereignis geworfen, auf das hier reagiert werden kann.
     *
     * Auf Basis der History-API und dem "popstate"-Ereignis lässt sich ein
     * noch ausgefeilterer Single Page Router entwickeln, der bei Bedarf auch
     * ohne das #-Zeichen in der URL auskommt. Dies würde jedoch sowohl mehr
     * Quellcode sowie eine spezielle Server-Konfiguration erfordern, um
     * wirklich stabil zu laufen. Denn der Single Page Router kann nur aktiv
     * werden, wenn die Seite schon geladen wurde, so dass insbesondere der
     * erste Aufruf, wenn ein so genannter "Deep Link", der nicht auf die
     * Startseite der Anwendung zeigt, aufgerufen wird, zu einem "404 Not Found"
     * Fehler führen kann. Der Server müsste in diesem Fall so konfiguriert
     * werden, dass er trotzdem die Startseite zurückliefert, auch wenn diese
     * nicht direkt angesprochen wurde. Diesen Aufwand sparen wir uns hier. :-)
     */
    _handleRouting() {
        let url = location.hash.slice(1);

        if (url.length === 0) {
            url = "/";
        }

        let matches = null;
        let route = this._routes.find(p => matches = url.match(p.url));

        if (!route) {
            console.error(`Keine Route zur URL ${url} gefunden!`);
            return;
        }

        route.show(matches);
    }
}

