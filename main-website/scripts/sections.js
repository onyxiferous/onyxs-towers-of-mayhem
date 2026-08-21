let cooling = false

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (event) {
        cooling = true
        const target = document.querySelector(this.getAttribute('href'));
        const container = document.querySelector('.block-content');

        if (!target || !container) return;

        event.preventDefault();

        const start = container.scrollTop;

        const rawTarget =
            target.offsetTop - container.offsetTop - 20;

        const maxScroll =
            container.scrollHeight - container.clientHeight;

        const targetPosition = Math.min(
            rawTarget,
            maxScroll
        );

        const distance = targetPosition - start;
        const duration = 800;

        let startTime = null;

        function ease(x) {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        }

        function animate(timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            container.scrollTop =
                start + distance * ease(progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {

    target.classList.add('section-highlight');

    setTimeout(() => {
        target.classList.remove('section-highlight');
    }, 100);

    cooling = false
            }
            
        }

        /* Highlight the actual section */
        target.classList.remove('section-highlight');

        // Force the browser to restart the animation
        void target.offsetWidth;

        target.classList.add('section-highlight');

        requestAnimationFrame(animate);

        history.pushState(
            null,
            "",
            this.getAttribute("href")
        );
    });
});