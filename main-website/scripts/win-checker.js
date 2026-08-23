async function checkTowerStatus() {
    const response = await fetch(
        'https://api.onyxs-towers.space/website/tower-wins'
    )

    const data = await response.json()

    if (data.happened) {
        const p = document.createElement('p')
        p.innerHTML = 'someone won a tower lol'
        document.body.appendChild(p);

        console.log('someone won a tower')
        const audio = document.createElement('audio');
        audio.src = '/assets/audio/tower-win.mp3';
        audio.play();

        setTimeout(() => {
            p.remove();
        }, 3000);
    }
}

setInterval(checkTowerStatus, 2000)