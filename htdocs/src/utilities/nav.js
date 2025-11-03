function renderNavTree(templateEl, routes) {
    const tpl = templateEl.content.cloneNode(true);
    const ul = tpl.querySelector('ul');

    routes.forEach(route => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = route.path;
        a.className = 'nav-link';
        a.innerHTML = `${route.icon ? `<span class="icon">${route.icon}</span> ` : ''}${route.title}`;
        li.appendChild(a);

        if (route.children && Array.isArray(route.children)) {
            const nested = renderNavTree(templateEl, route.children);
            li.appendChild(nested);
        }

        ul.appendChild(li);
    });

    return ul;
}

async function init() {
    const container = document.querySelector('#site-nav');
    const navPath = '/docs/dev/conf/nav.json';
    const navTemplatePath = '/docs/dev/pages/nav.html';

    const [navRes, htmlRes] = await Promise.all([
        fetch(navPath),
        fetch(navTemplatePath)
    ]);

    const navData = await navRes.json();
    const htmlText = await htmlRes.text();

    // Inject top-level <nav> wrapper
    container.innerHTML = htmlText;
    const navElement = container.querySelector('nav');
    const template = navElement.querySelector('template#navList');

    const ul = renderNavTree(template, navData.routes);
    const placeholder = navElement.querySelector('.nav-list');
    placeholder.replaceWith(ul);
}

init();
