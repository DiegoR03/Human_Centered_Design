// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
// Timestamps from https://spotscribe.io/episode/40874ea3ikx0LsNCglzekU
document.getElementById('vtt-player').textTracks[0].mode = "showing";

document.getElementById('vtt-player').addEventListener('play', function () {
    document.getElementById('vtt-text').style.display = "block";
    document.getElementById('prev-vtt-text').style.display = "block";
    document.getElementById('next-vtt-text').style.display = "block";
});

document.getElementById('vtt-player').textTracks[0].addEventListener('cuechange', function () {
    let current_Vtt_Text = document.getElementById('vtt-text');
    let prev_Vtt_Text = document.getElementById('prev-vtt-text');
    let next_Vtt_Text = document.getElementById('next-vtt-text');
    let allCues = this.cues;

    if (this.activeCues && this.activeCues.length > 0) {
        let currentCue = this.activeCues[0];
        // Om de index te krijgen van de huidige ondertiteling heb ik de volgende links gebruikt: 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from (pakt alle ondertiteling elementen, dus zinnen)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf (kiest alleen de cue die op dit moment de "huidige" cue moet zijn. De timestamps in de vtt file kiezen automatisch per zin welke op dat moment moet worden afgespeelt)
        let currentIndex = Array.from(allCues).indexOf(currentCue);

        current_Vtt_Text.innerHTML = currentCue.text;

        if (currentIndex > 0) {
            prev_Vtt_Text.innerHTML = allCues[currentIndex - 1].text;
        } 
        else if (currentIndex < allCues.length - 1) {
            next_Vtt_Text.innerHTML = allCues[currentIndex + 1].text;
        }

    } else {
        prev_Vtt_Text.innerHTML = "";
        current_Vtt_Text.innerHTML = "";
        next_Vtt_Text.innerHTML = "";
    }
});