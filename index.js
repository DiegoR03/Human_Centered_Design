// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const video = document.getElementById('media-video');
const transcriptContainer = document.getElementById('transcript');
const chapterList = document.getElementById('chapter-list');
const syncBtn = document.getElementById('sync-transcript'); 
const slider = document.getElementById("myRange");
let isUserScrolling = false;
let scrollTimeout = null;

const chapters = [
    { time: 0, label: 'Intro' },
    { time: 309, label: 'Type II Supernova' },
    { time: 476, label: 'Collapse' },
    { time: 524, label: 'Shockwave' },
    { time: 582, label: 'Explosion' },
    { time: 700, label: 'Polarisation Patterns' },
    { time: 854, label: 'Neutrinos' },
    { time: 936, label: 'Jets' },
    { time: 1017, label: 'SN 2024ggi' },
    { time: 1215, label: 'Catching More Supernova' },
    { time: 1361, label: 'Outro' }
];

function renderChapters() {
    chapterList.innerHTML = chapters.map((chapter, index) => `
        <li data-time="${chapter.time}" data-index="${index}">${chapter.label} (${chapter.time}s)</li>
    `).join('');

    chapterList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const time = Number(e.target.dataset.time);
            video.currentTime = time;
            video.play();
            highlightChapter(Number(e.target.dataset.index));
        }
    });
}

function highlightChapter(index) {
    document.querySelectorAll('.chapter-list li').forEach((li, i) => {
        li.classList.toggle('active-chapter', i === index);
    });
}

function setupVtt() {
    if (!video.textTracks?.[0]) return;
    
    const track = video.textTracks[0];
    track.mode = 'hidden';
    track.addEventListener('cuechange', () => {
        const cues = track.cues;
        if (cues && cues.length > 0 && transcriptContainer.children.length === 0) {
            transcriptContainer.innerHTML = Array.from(cues).map((cue, index) => {
                // Ik moest helaas weer aan Gemini vragen hoe ik de <c> elementen in mijn .vt bestanden om kon zetten naar een tekst bestand zodat ik de classes kon aanpassen. OP dit moment veranderde hij het hele div bestand terwijl ik losse <span> elementen nodig had
                // Antwoord: Om het omzetten van de VTT-tags naar echte HTML-spans te maken moet je de functie setupVtt aanpassen. Op dit moment wordt cue.text 1-op-1 in de HTML gezet. We gaan daar een .replace() tussenvoegen die de <c.enthusiastic> verandert in een <span class="enthusiastic">.
                const formattedText = cue.text
                    .replace(/<c\.(\w+)>/g, '<span class="$1">') 
                    .replace(/<\/c>/g, '</span>');

                return `
                    <div id="cue-${index}" class="transcript-line" style="margin-bottom: 5px; padding: 4px; border-radius: 4px; transition: all 0.3s ease;">
                        ${formattedText}
                    </div>
                `;
            }).join('');
        }
    });
}

const _interpSpeed = 1.5; 

setInterval(() => {
    if (slider.newValue === undefined) return;

    let currentValue = parseFloat(slider.value);
    let targetValue = slider.newValue;
    let delta = targetValue - currentValue;

    if (Math.abs(delta) < _interpSpeed) {
        slider.value = targetValue;
        delete slider.newValue;
        return;
    }

    let sign = delta / Math.abs(delta);
    slider.value = currentValue + (sign * _interpSpeed);
}, 1000 / 60);

function updateTranscriptHighlight() {
    const track = video.textTracks?.[0];
    if (!track || !track.cues || track.cues.length === 0) {
        return;
    }

    const cues = Array.from(track.cues);
    const currentTime = video.currentTime;

    let activeIndex = -1;
    for (let i = cues.length - 1; i >= 0; i--) {
        if (cues[i].startTime <= currentTime) {
            activeIndex = i;
            break;
        }
    }

    cues.forEach((_, index) => {
        const span = document.getElementById(`cue-${index}`);
        if (span) {
            if (index === activeIndex) {
                span.style.fontWeight = 'bold';
                span.classList.add('active-cue');
                span.style.opacity = '1';

                const currentCueText = cues[index].text;

                switch(true){
                    case currentCueText.includes('.enthusiastic') : {
                        document.body.style.setProperty('--color-start', '#bc571391');
                        slider.newValue = 30;
                        break;
                    } 
                    case currentCueText.includes('.happy') : {
                        document.body.style.setProperty('--color-start', '#02c80291');
                        slider.newValue = 90;
                        break;
                    } 
                    case currentCueText.includes('.angry') : {
                        document.body.style.setProperty('--color-start', '#ff000091');
                        slider.newValue = 10;
                        break;
                    } 
                    default: {
                        document.body.style.setProperty('--color-start', 'default');
                        document.body.style.setProperty('--color-end', 'default');
                    }
                }


                if (!isUserScrolling) {
                    span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                span.style.fontWeight = 'normal';
                span.classList.remove('active-cue');
                span.style.opacity = '0.6';
            }
        }
    });
}

function setupScrollingInteractions() {
    const handleUserScroll = () => {
        isUserScrolling = true;
        if (syncBtn) {
            syncBtn.style.display = 'block';
        }
    };

    transcriptContainer.addEventListener('wheel', handleUserScroll);
    transcriptContainer.addEventListener('touchmove', handleUserScroll);

    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            isUserScrolling = false;
            syncBtn.style.display = 'none';
            updateTranscriptHighlight(); 
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderChapters();
    setupVtt();
    setupScrollingInteractions();
    
    video.addEventListener('timeupdate', () => {
        const activeChapter = chapters.filter(chapter => chapter.time <= video.currentTime).pop();
        if (activeChapter) highlightChapter(chapters.indexOf(activeChapter));
        updateTranscriptHighlight();
    });
});

// Selecteer alle h2 elementen met de class 'collapsible'
const collapsibles = document.querySelectorAll('.collapsible');

collapsibles.forEach(header => {
    header.addEventListener('click', function() {
        // Zoek het ouder-element (de <section class="panel">)
        const panel = this.parentElement;
        
        // Toggle de 'collapsed' class op de panel
        panel.classList.toggle('collapsed');
    });
});