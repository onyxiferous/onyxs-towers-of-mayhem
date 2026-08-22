function isCurrentlyInMaintenance() {
    const now = new Date();

    const date = now.getUTCDate();       // Day of month (1, 15, 29)
    const hour = now.getUTCHours();      // Hour in UTC (0-23)
    const minute = now.getUTCMinutes();  // Minute in UTC (0-59)

    // Window 1: 1st of the month (06:30 - 07:00 UTC)
    if (date === 1 && hour === 6 && minute >= 30 && minute < 60) return true;

    // Window 2: 15th of the month (06:30 - 07:00 UTC)
    if (date === 15 && hour === 6 && minute >= 30 && minute < 60) return true;

    // Window 3: 29th of the month (06:30 - 07:30 UTC)
    if (date === 29) {
        if (hour === 6 && minute >= 30 && minute < 60) return true;
        if (hour === 7 && minute >= 0 && minute < 30) return true;
    }

    return false;
}

module.exports = { isCurrentlyInMaintenance };