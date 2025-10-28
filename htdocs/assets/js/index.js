(function () {
    // Optional: auto-redirect to last docs space; leave false unless desired.
    const AUTO_REDIRECT = false;
    const params = new URLSearchParams(location.search);
    const space = params.get('space') || localStorage.getItem('phantom.docs.space');
    if (AUTO_REDIRECT && (space === 'user' || space === 'dev')) {
        location.replace('/phantom/docs/' + space + '/');
    }
    // Remember docs choice
    addEventListener('click', e => {
        const a = e.target.closest('a[data-space]');
        if (a) localStorage.setItem('phantom.docs.space', a.dataset.space);
    }, {capture: true});

    // === Center-outward badge ordering ===
    // Rule: first badge in markup becomes the center; then alternate right/left.
    const holder = document.getElementById('badges');
    if (holder) {
        const nodes = Array.from(holder.children);
        if (nodes.length > 1) {
            const center = nodes[0];
            const left = [], right = [];
            let toRight = true;
            for (let i = 1; i < nodes.length; i++) {
                if (toRight) right.push(nodes[i]); else left.unshift(nodes[i]);
                toRight = !toRight;
            }
            const frag = document.createDocumentFragment();
            left.forEach(n => frag.appendChild(n));
            frag.appendChild(center);
            right.forEach(n => frag.appendChild(n));
            holder.appendChild(frag);
        }
    }
}());
