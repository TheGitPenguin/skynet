/**
 * Obtient l'heure locale formatée avec la zone horaire
 * Prend automatiquement en compte l'heure d'été et l'heure d'hiver
 * @returns Chaîne formatée avec heure et zone horaire (ex: "14:30:45 CET" ou "15:30:45 CEST")
 */
export function getLocalTimeString(): string {
    const now = new Date();
    
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris', // Change selon ta zone (Europe/London, America/New_York, etc.)
    };
    
    const timeString = new Intl.DateTimeFormat('fr-FR', timeOptions).format(now);
    
    // Obtient le nom de la zone horaire (CET, CEST, UTC, etc.)
    const tzOptions: Intl.DateTimeFormatOptions = {
        timeZoneName: 'short',
        timeZone: 'Europe/Paris',
    };
    
    const tzString = new Intl.DateTimeFormat('fr-FR', tzOptions).format(now);
    const tz = tzString.split(' ')[1]; // Extrait le timezone court (CET, CEST, etc.)
    
    return `${timeString} ${tz}`;
}

/**
 * Obtient la date et l'heure locale formatées
 * @returns Chaîne formatée (ex: "14.02.2026 14:30:45 CET")
 */
export function getLocalDateTimeString(): string {
    const now = new Date();
    
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris',
    };
    
    const dateTimeString = new Intl.DateTimeFormat('fr-FR', options).format(now);
    
    const tzOptions: Intl.DateTimeFormatOptions = {
        timeZoneName: 'short',
        timeZone: 'Europe/Paris',
    };
    
    const tzString = new Intl.DateTimeFormat('fr-FR', tzOptions).format(now);
    const tz = tzString.split(' ')[1];
    
    return `${dateTimeString} ${tz}`;
}

/**
 * Formate une date RSS en heure locale avec la zone horaire
 * @param dateString - Chaîne de date RSS (ISO ou RFC)
 * @returns Chaîne formatée avec zone horaire (ex: "14.02.2026 14:30:45 CET")
 */
export function formatRssDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Europe/Paris',
        };
        
        const dateTimeString = new Intl.DateTimeFormat('fr-FR', options).format(date);
        
        const tzOptions: Intl.DateTimeFormatOptions = {
            timeZoneName: 'short',
            timeZone: 'Europe/Paris',
        };
        
        const tzString = new Intl.DateTimeFormat('fr-FR', tzOptions).format(date);
        const tz = tzString.split(' ')[1];
        
        return `${dateTimeString} ${tz}`;
    } catch (error) {
        return dateString;
    }
}
