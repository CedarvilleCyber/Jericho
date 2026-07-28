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
    const triggers = document.getElementById('triggers');
    const displayText = document.getElementById('display-text');

    displayText.style.display = 'none';
    triggers.style.display = 'grid';
}

function showDisplay() {
    const triggers = document.getElementById('triggers');
    const displayText = document.getElementById('display-text');

    displayText.style.display = 'flex';
    triggers.style.display = 'none';

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
            showDisplay();
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
