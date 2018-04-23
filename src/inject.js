if (document.getElementById('root')) {
    console.log('Beta Site Detected!');
    betaSite();
} else {
    console.log('Legacy Site Detected!');
    legacySite();
}
