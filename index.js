// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
// Timestamps from https://spotscribe.io/episode/40874ea3ikx0LsNCglzekU
document.getElementById('vtt-player').textTracks[0].mode = "showing";

document.getElementById('vtt-player').textTracks[0].addEventListener('cuechange', function () {
    let current_Vtt_Text = document.getElementById('vtt-text');
    let prev_Vtt_Text = document.getElementById('prev-vtt-text');
    let next_Vtt_Text = document.getElementById('next-vtt-text');
    let allCues = this.cues;

    current_Vtt_Text.style.transition = "none";
    current_Vtt_Text.style.transform = "translateY(20px)";
    current_Vtt_Text.style.opacity = "0";
    
    prev_Vtt_Text.style.transition = "none";
    prev_Vtt_Text.style.transform = "translateY(20px)";
    prev_Vtt_Text.style.opacity = "0";

    next_Vtt_Text.style.transition = "none";
    next_Vtt_Text.style.transform = "translateY(20px)";
    next_Vtt_Text.style.opacity = "0";


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
        
        if (currentIndex < allCues.length - 1) {
            next_Vtt_Text.innerHTML = allCues[currentIndex + 1].text;
        }
    } else {
        prev_Vtt_Text.innerHTML = "";
        current_Vtt_Text.innerHTML = "";
        next_Vtt_Text.innerHTML = "";
    }
    setTimeout(() => {
        current_Vtt_Text.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
        current_Vtt_Text.style.transform = "translateY(0px)";
        current_Vtt_Text.style.opacity = "1";

        prev_Vtt_Text.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
        prev_Vtt_Text.style.transform = "translateY(0px)";
        prev_Vtt_Text.style.opacity = "0.5";

        next_Vtt_Text.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
        next_Vtt_Text.style.transform = "translateY(0px)";
        next_Vtt_Text.style.opacity = "0.5";
    }, 20);
});