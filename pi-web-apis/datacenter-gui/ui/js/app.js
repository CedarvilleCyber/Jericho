// Animation config maps animation names to their CSS class pairs and durations
const ANIMATIONS = {
    fade:  { enter: 'anim-fade-in',  exit: 'anim-fade-out',  duration: 800 },
    slide: { enter: 'anim-slide-in', exit: 'anim-slide-out', duration: 600 },
    zoom:  { enter: 'anim-zoom-in',  exit: 'anim-zoom-out',  duration: 500 },
};

const displayEl = document.getElementById('display-text');
let isAnimating = false;

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
}

function playEnter(anim) {
    displayEl.classList.add(anim.enter);

    setTimeout(() => {
        displayEl.classList.remove(anim.enter);
        isAnimating = false;
    }, anim.duration);
}

function showTriggers() {
    const triggers = document.getElementById('triggers');
    const displayText = document.getElementById('display-text');

    displayText.style.display = 'none';
    triggers.style.display = 'grid';
}

function showDisplay() {
    const triggers = document.getElementById('triggers');
    const displayText = document.getElementById('display-text');

    displayText.style.display = 'block';
    triggers.style.display = 'none';

}