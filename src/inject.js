if (document.querySelector('[data-reactroot], [data-reactid]')) {
    console.log('Beta Site Detected!');
    betaSite();
} else {
    console.log('Legacy Site Detected!');
    legacySite();
}
