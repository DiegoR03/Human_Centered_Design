// Text format: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const video = document.getElementById('media-video');
const prevVttText = document.getElementById('prev-vtt-text');
const vttText = document.getElementById('vtt-text');
const nextVttText = document.getElementById('next-vtt-text');
const chapterList = document.getElementById('chapter-list');

const chapters = [
    { time: 0, label: 'Intro' },
    { time: 35, label: 'Chapter 1' },
    { time: 92, label: 'Chapter 2' },
    { time: 157, label: 'Chapter 3' },
    { time: 230, label: 'Conclusion' }
];

function renderChapters() {
    chapterList.innerHTML = chapters.map((ch, index) => `
        <li data-time="${ch.time}" data-index="${index}">${ch.label} (${ch.time}s)</li>
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
    track.addEventListener('cuechange', () => {
        const cues = track.cues;
        const active = track.activeCues[0];

        if (active) {
            const index = Array.from(cues).indexOf(active);
            vttText.innerHTML = active.text;
            prevVttText.innerHTML = index > 0 ? cues[index - 1].text : '';
            nextVttText.innerHTML = index < cues.length - 1 ? cues[index + 1].text : '';
        } else {
            vttText.innerHTML = prevVttText.innerHTML = nextVttText.innerHTML = '';
        }
    });
    
    track.mode = 'hidden';
}

document.addEventListener('DOMContentLoaded', () => {
    video.src = 'uploads/SupernovaPodcast.m4a';
    renderChapters();
    setupVtt();
    
    video.addEventListener('timeupdate', () => {
        const active = chapters.filter(ch => ch.time <= video.currentTime).pop();
        if (active) highlightChapter(chapters.indexOf(active));
    });
});