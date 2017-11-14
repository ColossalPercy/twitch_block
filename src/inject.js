if (localStorage.getItem('twilight.sessionID')) {
    console.log('Beta Site Detected!');
    betaSite();
} else {
    console.log('Legacy Site Detected!');
    legacySite();
}
