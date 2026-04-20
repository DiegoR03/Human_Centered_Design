// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const video = document.getElementById('media-video');
const transcriptContainer = document.getElementById('transcript');
const chapterList = document.getElementById('chapter-list');
const syncBtn = document.getElementById('sync-transcript'); 
const slider = document.getElementById("myRange");
const collapsibles = document.querySelectorAll('.collapsible');
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

const fontSizeSlider = document.getElementById("font-size-slider");
const fontSizeValue = document.getElementById("font-size-value");
const transcript = document.getElementById("transcript");
const slideContainer = document.querySelector('.slidecontainer');

let easingFactor = 1;
let isUserScrolling = false;
let scrollTimeout = null;

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

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
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
                    <div id="cue-${index}" class="transcript-line">
                        <button class="timestamp-btn" data-time="${cue.startTime}">
                            ${formatTime(cue.startTime)}
                        </button>
                        ${formattedText}
                    </div>
                `;
            }).join('');

            transcriptContainer.addEventListener('click', (button) => {
                const timeButton = button.target.closest('.timestamp-btn');
                if (timeButton) {
                    video.currentTime = Number(timeButton.dataset.time);
                    video.play();
                }
            });
        }
    });
}

setInterval(() => {
    if (slider.newValue === undefined) return;

    let currentValue = parseFloat(slider.value);
    let targetValue = slider.newValue;
    let delta = targetValue - currentValue;

    if (Math.abs(delta) < 0.1) {
        slider.value = targetValue;
        delete slider.newValue;
        return;
    }

    // Gevraagt aan gemini hoe ik meer een 'ease' effect kan krijgen op een value change
    // Antwoord: Op dit moment gebruik je een lineaire beweging: de slider verplaatst zich met een constante snelheid (sliderSpeed). Om een ease-in effect te krijgen, moet de snelheid beginnen bij nul en langzaam toenemen naarmate hij dichter bij het doel komt. In JavaScript-animaties doen we dit vaak door de stapgrootte te baseren op een fractie van de resterende afstand.
    let step = delta * (easingFactor / 10);
    
    const minStep = 0.5; 
    if (Math.abs(step) < minStep) {
        step = Math.sign(delta) * minStep;
    }

    slider.value = currentValue + step;
}, 1000 / 60);

// Gemaakt met behulp van Gemini, ik vroeg hem hoe ik de <c> tags in mijn .vtt bestanden kon omzetten naar losse <span> elementen zodat ik er CSS op kon toepassen.
function updateTranscriptHighlight() {
    const track = video.textTracks?.[0];
    if (!track || !track.cues || track.cues.length === 0) return;

    const cues = Array.from(track.cues);
    const currentTime = video.currentTime;
    let activeIndex = cues.findIndex((cue, i) => 
        currentTime >= cue.startTime && 
        (i === cues.length - 1 || currentTime < cues[i + 1].startTime)
    );

    if (activeIndex === -1) return;
    
    document.querySelectorAll('.active-cue').forEach(oldSpan => {
        if (oldSpan.id !== `cue-${activeIndex}`) {
            oldSpan.classList.remove('active-cue');
            oldSpan.style.fontWeight = 'normal';
            oldSpan.style.opacity = '0.6';
        }
    });

    const range = [activeIndex - 1, activeIndex, activeIndex + 1];

    range.forEach(index => {
        if (index < 0 || index >= cues.length) return;

        const span = document.getElementById(`cue-${index}`);
        if (!span) return;

        if (index === activeIndex) {
            if (!span.classList.contains('active-cue')) {
                span.classList.add('active-cue');
                span.style.fontWeight = 'bold';
                span.style.opacity = '1';
                
                if (!isUserScrolling) {
                    span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                updateVisualTheme(cues[index].text);
            }

            const specialSpans = span.querySelectorAll('.enthusiastic, .happy, .angry');
            specialSpans.forEach(specialSpan => {
                if (specialSpan.getAttribute('data-split') !== 'true') {
                    const text = specialSpan.textContent;
                    specialSpan.innerHTML = '';
                    specialSpan.setAttribute('data-split', 'true');

                    [...text].forEach((char, i) => {
                        const charSpan = document.createElement('span');
                        charSpan.textContent = char === ' ' ? '\u00A0' : char;
                        charSpan.style.setProperty('--span-index', i);
                        charSpan.classList.add('character-span');
                        specialSpan.appendChild(charSpan);
                    });
                }
            });

        } else {
            span.classList.remove('active-cue');
            span.style.fontWeight = 'normal';
            span.style.opacity = '0.6';
        }
    });
}

function updateVisualTheme(text) {
    switch (true) {
        case text.includes('.enthusiastic'):
            document.body.style.setProperty('--color-start', 'var(--enthusiastic-color)');
            slider.newValue = 0;
            break;
        case text.includes('.happy'):
            document.body.style.setProperty('--color-start', 'var(--happy-color)');
            slider.newValue = 50;
            break;  
        case text.includes('.serious'):
            document.body.style.setProperty('--color-start', 'var(--serious-color)');
            slider.newValue = 100;
            break;
        case text.includes('.sad'):
            document.body.style.setProperty('--color-start', 'var(--sad-color)');
            slider.newValue = 75;
            break;
        default:
            document.body.style.setProperty('--color-start', 'initial');
            break;
    }    
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

collapsibles.forEach(header => {
    header.addEventListener('click', function() {
        const panel = this.parentElement;
        panel.classList.toggle('collapsed');
    });
});

// MARK: Settings
function showSettings() {
    const settingsBox = document.getElementById('settings-box');    
    if (settingsBox.style.display === 'block') {
        settingsBox.style.display = 'none';
    } else {
        settingsBox.style.display = 'block';
    }
}

fontSizeSlider.addEventListener("input", () => {
    const fontSize = fontSizeSlider.value;
    transcript.style.setProperty('--transcript-font-size', `${fontSize}px`);
    fontSizeValue.textContent = `${fontSize}px`;
});

document.getElementById('emotion-slider-toggle').addEventListener('change', function() {
    if (this.checked) {
        slideContainer.style.display = 'block';
    } else {
        slideContainer.style.display = 'none';
    }
});

document.getElementById('real-full-toggle').addEventListener('change', function() {
    if (this.checked) {
        transcript.classList.add('show-all');
    } else {
        transcript.classList.remove('show-all');
        updateTranscriptHighlight();
    }
});
