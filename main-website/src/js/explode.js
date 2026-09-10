const sillyCat = document.getElementById('sillycat');

function explodeSelf() {
    const zabluetooth = document.createElement('audio');
    const scream = document.createElement('audio');

    zabluetooth.src = '/assets/audio/tower-win.mp3';
    scream.src = '/assets/audio/scream.mp3';
    zabluetooth.play();

    setTimeout(() => {
        zabluetooth.pause();
        zabluetooth.remove();
        scream.play();
        sillyCat.classList.add('agony');

        setTimeout(() => {
            scream.pause();
            scream.remove();
            sillyCat.remove();
        }, 200);
    }, 1400);
}

setTimeout(explodeSelf, 2000);