window.addEventListener('scroll', function () {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    if (window.scrollY > 40) {
        header.classList.remove('top');
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
        header.classList.add('top');
    }
});

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
        mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mainNav.classList.remove('open');
        });
    });
}

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal-right').forEach(function (el) {
    observer.observe(el);
});

window.dispatchEvent(new Event('scroll'));

/* Activa animación de categorías después de cargar */
window.addEventListener('load', function () {
    setTimeout(function () {
        document.body.classList.add('site-ready');
    }, 180);
});
