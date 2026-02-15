/**
 * Gets the current time formatted with timezone
 * Automatically accounts for daylight saving time
 * @returns Formatted string with time and timezone (ex: "14:30:45 CET" or "15:30:45 CEST")
 */
export function getLocalTimeString(): string {
    const now = new Date();
    
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris', // Change according to your timezone (Europe/London, America/New_York, etc.)
    };
    
    const timeString = new Intl.DateTimeFormat('fr-FR', timeOptions).format(now);
    
    // Gets the timezone name (CET, CEST, UTC, etc.)
    const tzOptions: Intl.DateTimeFormatOptions = {
        timeZoneName: 'short',
        timeZone: 'Europe/Paris',
    };
    
    const tzString = new Intl.DateTimeFormat('fr-FR', tzOptions).format(now);
    const tz = tzString.split(' ')[1]; // Extract short timezone (CET, CEST, etc.)
    
    return `${timeString} ${tz}`;
}

/**
 * Gets the local date and time formatted
 * @returns Formatted string (ex: "14.02.2026 14:30:45 CET")
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
 * Formats an RSS date to local time with timezone
 * @param dateString - RSS date string (ISO or RFC)
 * @returns Formatted string with timezone (ex: "14.02.2026 14:30:45 CET")
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
