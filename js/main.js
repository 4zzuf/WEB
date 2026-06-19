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

window.addEventListener('load', function () {
    setTimeout(function () {
        document.body.classList.add('site-ready');
    }, 180);
});

const billAmount = document.getElementById('billAmount');
const lossLow = document.getElementById('lossLow');
const lossHigh = document.getElementById('lossHigh');
const lossMessage = document.getElementById('lossMessage');
const calculatorWhatsapp = document.getElementById('calculatorWhatsapp');

function formatSoles(value) {
    return 'S/ ' + Math.round(value).toLocaleString('es-PE');
}

function updateLossEstimate() {
    if (!billAmount || !lossLow || !lossHigh || !lossMessage || !calculatorWhatsapp) return;

    const monthlyBill = Math.max(Number(billAmount.value) || 0, 0);
    const low = monthlyBill * 0.08;
    const high = monthlyBill * 0.20;
    const billText = formatSoles(monthlyBill);
    const lowText = formatSoles(low);
    const highText = formatSoles(high);

    lossLow.textContent = lowText;
    lossHigh.textContent = highText;
    lossMessage.textContent = 'Si pagas ' + billText + ' al mes, una oportunidad del 8% al 20% equivale a ' + lowText + ' - ' + highText + ' mensuales.';
    calculatorWhatsapp.href = 'https://wa.me/51934724576?text=' + encodeURIComponent('Hola, pago aproximadamente ' + billText + ' al mes de luz y quiero saber si estoy pagando de más. Puedo enviar mi recibo para revisión.');
}

if (billAmount) {
    billAmount.addEventListener('input', updateLossEstimate);
    updateLossEstimate();
}
