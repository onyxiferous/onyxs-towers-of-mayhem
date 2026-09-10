const events = new EventSource(
    'https://api.onyxs-towers.space/website/tower-wins'
);

events.addEventListener('towerWin', event => {
    const data = JSON.parse(event.data);

    console.log('Someone won a tower!', data);

    const p = document.createElement('p');
    p.textContent = 'someone join da game lol';

    document.body.appendChild(p);

    const audio = new Audio('/assets/audio/tower-win.mp3');
    audio.play();

    setTimeout(() => {
        p.remove();
    }, 3000);
});

events.onerror = error => {
    console.error('Tower-win event connection error:', error);
};