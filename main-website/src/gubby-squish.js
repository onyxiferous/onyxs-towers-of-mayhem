const gubby = document.getElementById('gubby')
const gubbyStatus = document.getElementById('gubby-status')

const petIntervals = [5, 90]

let canSquish = true
let isAngry = false
let lastAnimationDuration
let petNotifications = ['Gubby wants you to pet him.', 'Gubby demands some TLC.', 'Give Gubby some love.', 'Gubby lets out a mrrp.', 'Gubby stares at you intently.', 'Gubby violently shakes, demanding your attention.', 'You feel a strong urge to pet Gubby.', 'Gubby inches towards you.', 'Gubby wants you.']
let satisfiedNotfiications = ['Gubby is satisfied.', 'Gubby mrrps at you.', 'Gubby loves your attention.', 'Gubby wants more pets.', 'Gubby\'s ears twitch while you pet him.', 'Gubby is happy with your service.', 'You give Gubby some belly rubs. He is happy.', 'You boop Gubby on the nose. He lets out a quiet mrrp.']
let angryNotifications = ['You are petting him too fast.', 'Gubby does not consent.', 'Gubby is not satisfied.', 'Gubby does not want you to pet him.', 'You are petting Gubby too fast.', 'Even though Gubby lets out a mrrp, he stares coldly at you.', 'Gubby wants someone else to pet him.', 'Gubby will never be happy.', 'Gubby doesn\'t want anything to do with you right now.', 'Gubby wants you to leave. He is not happy.', 'Gubby is neither satisfied nor upset.']
let timesPet = {}

function addStatus(text) {
    const p = document.createElement('p')
    p.innerHTML = text
    gubbyStatus.appendChild(p)

    p.addEventListener("animationend", () => {
         p.remove();
    });
}

function determineTimePet() {
    const time = Date.now() / 1000;
    const numberOfTimesPet = Object.keys(timesPet).length + 1;

    timesPet[numberOfTimesPet] = time;
}

function determineIsAngry() {
    const lastTimePet = Object.values(timesPet).at(-1);
    const timeDifference = Date.now() / 1000 - lastTimePet;

    return timeDifference >= petIntervals[1] || timeDifference <= petIntervals[0];
}

function squishGubbyEnd() {
    gubby.style.animationName = 'gubby-idle'
    gubby.style.animationDuration = lastAnimationDuration
    gubby.style.animationIterationCount = 'infinite'

    setTimeout(() => {
        canSquish = true
    }, 1000);
}

function squishGubby() {
    if (!canSquish) {
        return;
    }

    isAngry = determineIsAngry();
    determineTimePet();

    const notificationToUse = !isAngry ? satisfiedNotfiications : angryNotifications
    const randomNotificationText = notificationToUse[Math.floor(Math.random() * notificationToUse.length)]
    const audio = document.createElement('audio');

    addStatus(randomNotificationText)
    canSquish = false;
    lastAnimationDuration = gubby.style.animationDuration;

    audio.src = '/assets/audio/gubby.mp3';

     if (!isAngry) {
        gubby.style.animationName = 'gubby-squish'; 
    } else {
        audio.preservesPitch = false
        audio.playbackRate = 0.9
    }

    audio.play();
    gubby.style.animationDuration = '500ms';
    gubby.style.animationIterationCount = 2;

    gubby.addEventListener("animationend", squishGubbyEnd);
}

setInterval(() => {
    addStatus(petNotifications[Math.floor(Math.random() * petNotifications.length)])
}, 10000);

gubby.onclick = squishGubby