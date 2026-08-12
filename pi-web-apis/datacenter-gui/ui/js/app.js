// Animation config maps animation names to their CSS class pairs and durations
const ANIMATIONS = {
    fade:  { enter: 'anim-fade-in',  exit: 'anim-fade-out',  duration: 800 },
    slide: { enter: 'anim-slide-in', exit: 'anim-slide-out', duration: 600 },
    zoom:  { enter: 'anim-zoom-in',  exit: 'anim-zoom-out',  duration: 500 },
};

const displayEl = document.getElementById('display-text');
const triggersEl = document.getElementById('triggers');
const livestreamEl = document.getElementById('livestream');
const streamSelectorEl = document.getElementById('stream-selector');
const streamVideoEl = document.getElementById('stream-video');
const streamLabelEl = document.getElementById('stream-label');
const streamMessageEl = document.getElementById('stream-message');
let isAnimating = false;
let activeView = 'display';
let activeStreamIndex = 0;
let streamPlayer = null;

// Match the website livestream URL shape: {base}/live/{streamKey}.flv.
// Change this value if the SRS/live stream host is different from jericho.local.
const STREAM_BASE_URL = (window.JERICHO_STREAM_BASE_URL || 'http://jericho.local').replace(/\/$/, '');
const LIVESTREAMS = [
    { label: 'Nuclear', streamKey: 'nuclear' },
    { label: 'Traffic Light', streamKey: 'traffic' },
    { label: 'Water Treatment Plant', streamKey: 'watertreatment' },
    { label: 'Datacenter', streamKey: 'datacenter' },
];

/**
 * showText is called by Go through webview to update the displayed text.
 * @param {string} text - The text to display
 * @param {string} animationType - One of: "fade", "slide", "zoom"
 */
function showText(text, animationType) {
    // If already animating, queue will be ignored — extend this if you want queuing
    if (isAnimating) return;
    isAnimating = true;

    const anim = ANIMATIONS[animationType] || ANIMATIONS.fade;
    const coin = document.getElementById('coin');
    // If there's existing text, play the exit animation first
    if (displayEl.textContent.trim() !== '') {
        displayEl.classList.add(anim.exit);

        setTimeout(() => {
            displayEl.classList.remove(anim.exit);
            displayEl.textContent = text;
            playEnter(anim);
        }, anim.duration);
    } else {
        // No existing text, go straight to enter animation
        displayEl.textContent = text;
        playEnter(anim);
    }
    setTimeout(function() {
       displayEl.innerHTML = '';
       displayEl.appendChild(coin);


    }, 10000)
}

function playEnter(anim) {
    displayEl.classList.add(anim.enter);

    setTimeout(() => {
        displayEl.classList.remove(anim.enter);
        isAnimating = false;
    }, anim.duration);
}

function showTriggers() {
    activeView = 'triggers';
    stopLivestreamPlayer();

    displayEl.style.display = 'none';
    livestreamEl.style.display = 'none';
    triggersEl.style.display = 'grid';
}

function showDisplay() {
    activeView = 'display';
    stopLivestreamPlayer();

    displayEl.style.display = 'flex';
    triggersEl.style.display = 'none';
    livestreamEl.style.display = 'none';
}

function showLivestream() {
    activeView = 'livestream';

    displayEl.style.display = 'none';
    triggersEl.style.display = 'none';
    livestreamEl.style.display = 'flex';
    selectLivestream(activeStreamIndex);
}

function buildStreamUrl(stream) {
    return `${STREAM_BASE_URL}/live/${stream.streamKey}.flv`;
}

function buildSnapshotUrl(stream) {
    return `${STREAM_BASE_URL}/snapshot/${stream.streamKey}.jpg`;
}

function setStreamMessage(message) {
    streamMessageEl.textContent = message;
    streamMessageEl.style.display = message ? 'flex' : 'none';
}

function stopLivestreamPlayer() {
    setStreamMessage('');

    if (streamPlayer) {
        streamPlayer.destroy();
        streamPlayer = null;
    }

    streamVideoEl.removeAttribute('src');
    streamVideoEl.load();
}

function selectLivestream(index) {
    const stream = LIVESTREAMS[index];
    if (!stream) return;

    activeStreamIndex = index;
    streamLabelEl.textContent = stream.label;

    document.querySelectorAll('.stream-option').forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === index);
    });

    stopLivestreamPlayer();

    if (!window.flvjs) {
        setStreamMessage('FLV player library did not load.');
        return;
    }

    if (!window.flvjs.isSupported()) {
        setStreamMessage('This display does not support FLV playback.');
        return;
    }

    const streamUrl = buildStreamUrl(stream);
    setStreamMessage('Loading livestream...');

    streamPlayer = window.flvjs.createPlayer({
        type: 'flv',
        url: streamUrl,
        isLive: true,
    });
    streamPlayer.attachMediaElement(streamVideoEl);
    streamPlayer.load();

    const playPromise = streamVideoEl.play();
    if (playPromise) {
        playPromise.catch((err) => {
            console.warn('Livestream autoplay was blocked', err);
            setStreamMessage('Press play to start the livestream.');
        });
    }

    streamPlayer.on(window.flvjs.Events.ERROR, (errorType, errorDetail) => {
        console.error('Livestream failed', errorType, errorDetail);
        setStreamMessage(`Unable to load ${stream.label}.`);
    });

    streamVideoEl.onplaying = () => setStreamMessage('');
}

function renderStreamSelector() {
    streamSelectorEl.innerHTML = '';

    LIVESTREAMS.forEach((stream, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'stream-option';
        button.setAttribute('aria-label', `Show ${stream.label}`);
        button.onclick = () => selectLivestream(index);

        const thumb = document.createElement('span');
        thumb.className = 'stream-thumb';
        thumb.style.backgroundImage = `url("${buildSnapshotUrl(stream)}")`;

        const label = document.createElement('span');
        label.className = 'stream-option-label';
        label.textContent = stream.label;

        button.append(thumb, label);
        streamSelectorEl.appendChild(button);
    });
}

async function triggerEffectButton(name) {
    try {
        const result = await window.triggerEffect(name);
        console.log(`${name} triggered`, result);
    } catch (err) {
        console.error(`Failed to trigger ${name}`, err);
    }
}

(function() {
    const TAP_COUNT_REQUIRED = 5;
    const TAP_WINDOW_MS = 2000; // taps must land within 2s of each other
    const AUTO_HIDE_MS = 15000; // auto hide the header after 15s

    let taps = 0;
    let tapTimer = null;
    let hideTimer = null;

    const menuBar = document.getElementById('menu-bar');

    function resetTapWindow() {
        taps = 0;
        clearTimeout(tapTimer);
    }

    function showMenu() {
        menuBar.classList.add('visible');
        restartHideTimer();
    }

    function restartHideTimer() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            menuBar.classList.remove('visible');
            if (activeView === 'triggers' || activeView === 'livestream') {
                showDisplay();
            }
        }, AUTO_HIDE_MS);
    }

    function isMenuVisible() {
        return menuBar.classList.contains('visible');
    }


    document.addEventListener('touchstart', handleTap, { passive: true });
    document.addEventListener('click', handleTap);

    function handleTap(e) {
        // If the menu is visible, any touch/click will reset the timer to auto hide the menu
        if(isMenuVisible()) {
            restartHideTimer();
            return;
        }

        // Menu is hidden - count taps towards revealing the menu
        taps++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(resetTapWindow, TAP_WINDOW_MS);

        if (taps >= TAP_COUNT_REQUIRED) {
            resetTapWindow();
            showMenu();
        }
    }


})();

renderStreamSelector();
