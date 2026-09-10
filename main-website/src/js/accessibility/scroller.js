const TRIGGER_KEY = 'ScrollLock';
const HEADS_UP_TEXT = 'You just triggered one of accessibility features on this site to turn off the custom scroll bars; perhaps on accident. Do you want to turn them off?';
const KEEP_ON_TEXT = 'Wanna keep them off? (Simply press ScrollLock to turn it on again - or press Cancel if it\'s only for this session.)';

function processInput(keyboardEvent) {
    if (keyboardEvent.key == TRIGGER_KEY) {
        askKeepOn(confirm(HEADS_UP_TEXT));
    }
}

function askKeepOn() {
    const answer = confirm(KEEP_ON_TEXT);

    if (answer) {

    } else {
        document.documentElement.setAttribute('use-default', true);
    }
}

document.addEventListener('keydown', (keyboardEvent) => {
    processInput(keyboardEvent);
});