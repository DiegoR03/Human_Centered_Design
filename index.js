// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const video = document.getElementById('media-video');
const transcriptContainer = document.getElementById('transcript');
const chapterList = document.getElementById('chapter-list');
const syncBtn = document.getElementById('sync-transcript'); 
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
            transcriptContainer.innerHTML = Array.from(cues).map((cue, index) => `
                <div id="cue-${index}" style="margin-bottom: 5px; padding: 4px; border-radius: 4px; transition: all 0.3s ease;">
                    ${cue.text}
                </div>
            `).join('');
        }
    });
}

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
                span.style.opacity = '1';

                if (!isUserScrolling) {
                    span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                span.style.fontWeight = 'normal';
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