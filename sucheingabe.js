/* Diese Funktion soll ermöglichen, dass ein Suchbegriff unabhänig von Groß- und Kleinschreibung auf Ergebnisse trifft */ 
function ersterBuchstabeInCaps(wort){
    if(wort.length == 0){
        return wort;
    }

    return wort.charAt(0).toUpperCase() + wort.slice(1).toLowerCase();
}
