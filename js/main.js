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
const calcRegion = document.getElementById('calcRegion');
const calcUserType = document.getElementById('calcUserType');
const calculatorWhatsapp = document.getElementById('calculatorWhatsapp');

function formatSoles(value) {
    return 'S/ ' + Math.round(value).toLocaleString('es-PE');
}

// Fallback local con los datos exactos del servidor en caso de estar offline
const fallbackConfig = {
    tariffs: [
        { sector_id: "CUSCO", sector_name: "Cusco (Sector Típico 3)", tariff_code: "BT5B_COM", energy_charge_kwh: 0.6874, fixed_charge: 4.15 },
        { sector_id: "CUSCO", sector_name: "Cusco (Sector Típico 3)", tariff_code: "BT5B_RES", energy_charge_kwh: 0.6822, fixed_charge: 4.15 },
        { sector_id: "CUSCO", sector_name: "Cusco (Sector Típico 3)", tariff_code: "BT4", energy_charge_kwh: 0.4220, fixed_charge: 5.50 },
        { sector_id: "CUSCO", sector_name: "Cusco (Sector Típico 3)", tariff_code: "MT4", energy_charge_kwh: 0.2640, fixed_charge: 8.50 },
        
        { sector_id: "URUBAMBA", sector_name: "Urubamba (Sector Típico 4)", tariff_code: "BT5B_COM", energy_charge_kwh: 0.7450, fixed_charge: 4.20 },
        { sector_id: "URUBAMBA", sector_name: "Urubamba (Sector Típico 4)", tariff_code: "BT5B_RES", energy_charge_kwh: 0.7415, fixed_charge: 4.20 },
        { sector_id: "URUBAMBA", sector_name: "Urubamba (Sector Típico 4)", tariff_code: "BT4", energy_charge_kwh: 0.4580, fixed_charge: 5.50 },
        { sector_id: "URUBAMBA", sector_name: "Urubamba (Sector Típico 4)", tariff_code: "MT4", energy_charge_kwh: 0.2830, fixed_charge: 8.50 },
        
        { sector_id: "PEM", sector_name: "Puerto Maldonado (Sector Típico 3)", tariff_code: "BT5B_COM", energy_charge_kwh: 0.7890, fixed_charge: 4.30 },
        { sector_id: "PEM", sector_name: "Puerto Maldonado (Sector Típico 3)", tariff_code: "BT5B_RES", energy_charge_kwh: 0.7850, fixed_charge: 4.30 },
        { sector_id: "PEM", sector_name: "Puerto Maldonado (Sector Típico 3)", tariff_code: "BT4", energy_charge_kwh: 0.4910, fixed_charge: 5.50 },
        { sector_id: "PEM", sector_name: "Puerto Maldonado (Sector Típico 3)", tariff_code: "MT4", energy_charge_kwh: 0.3020, fixed_charge: 8.50 }
    ],
    items: [
        { item_code: "PANEL-550W", price: 690.00 },
        { item_code: "INV-HYBRID-6KW", price: 2610.00 },
        { item_code: "ESTRUCTURA-PANEL", price: 25.00 },
        { item_code: "CABLE-SOLAR-M", price: 1.20 },
        { item_code: "MANO-OBRA-KW", price: 150.00 }
    ],
    default_hsp: {
        CUSCO: 5.3,
        URUBAMBA: 5.4,
        PEM: 4.5
    }
};

let calculatorConfig = fallbackConfig;

const calcUserType = document.getElementById('calcUserType');

function updateLossEstimate() {
    if (!billAmount || !calcRegion || !calcUserType) return;

    const region = calcRegion.value;
    const userType = calcUserType.value;
    const monthlyBill = Math.max(Number(billAmount.value) || 0, 0);

    // Inferir la tarifa eléctrica de Electro Sur Este según el tipo de uso y el monto de consumo
    let tariffCode = "BT5B_COM";
    if (userType === "RESIDENCIAL") {
        tariffCode = "BT5B_RES";
    } else {
        if (monthlyBill < 1500) {
            tariffCode = "BT5B_COM";
        } else if (monthlyBill >= 1500 && monthlyBill < 5000) {
            tariffCode = "BT4";
        } else {
            tariffCode = "MT4";
        }
    }

    // 1. Encontrar la tarifa específica en los datos del servidor (o fallback local)
    const tariff = calculatorConfig.tariffs.find(t => t.sector_id === region && t.tariff_code === tariffCode)
        || fallbackConfig.tariffs.find(t => t.sector_id === region && t.tariff_code === tariffCode);

    // Aplicar IGV del 18% a la tarifa que viene de base de datos
    const rateWithIgv = (tariff ? tariff.energy_charge_kwh : 0.6874) * 1.18;

    // 2. Calcular consumo mensual en kWh
    const monthlyKwh = rateWithIgv > 0 ? (monthlyBill / rateWithIgv) : 0;

    // Se estima que un negocio diurno cubre el 50% de su consumo mensual con paneles solares
    const solarCoverageRatio = 0.50;
    const daytimeKwh = monthlyKwh * solarCoverageRatio;

    // 3. Obtener HSP y calcular tamaño en kWp
    const hsp = (calculatorConfig.default_hsp && calculatorConfig.default_hsp[region])
        || fallbackConfig.default_hsp[region] || 5.3;
    const systemEfficiency = 0.80; // 20% de pérdidas técnicas
    const dailyKwhNeeded = daytimeKwh / 30;
    const systemSizeKwp = dailyKwhNeeded / (hsp * systemEfficiency);

    // Cantidad de paneles de 550Wp
    const panelPowerKwp = 0.55;
    const panelsNeeded = Math.ceil(systemSizeKwp / panelPowerKwp) || 0;

    // 4. Obtener precios de equipos desde la base de datos centralizada/local
    const getPrice = (code, def) => {
        const item = calculatorConfig.items.find(i => i.item_code === code);
        return item ? item.price : def;
    };

    const panelPrice = getPrice("PANEL-550W", 690.00);
    const inverterPrice = getPrice("INV-HYBRID-6KW", 2610.00);
    const structurePrice = getPrice("ESTRUCTURA-PANEL", 25.00);
    const cablePrice = getPrice("CABLE-SOLAR-M", 1.20);
    const laborPrice = getPrice("MANO-OBRA-KW", 150.00);

    // Calcular CAPEX (materiales + mano de obra + 25% margen)
    const costPanels = panelsNeeded * panelPrice;
    // Inversor escalado según la potencia del sistema (base 6kWp)
    const costInverter = inverterPrice * Math.max(1, systemSizeKwp / 6.0);
    const costStructure = panelsNeeded * structurePrice;
    const costCable = panelsNeeded * 15 * cablePrice;
    const costLabor = systemSizeKwp * laborPrice;

    const baseCapex = costPanels + costInverter + costStructure + costCable + costLabor;
    const totalCapex = baseCapex * 1.25;

    // Ahorro financiero neto (restando 1.5% anual del CAPEX para OPEX de mantenimiento)
    const monthlySavings = daytimeKwh * rateWithIgv;
    const annualSavingsNet = (monthlySavings * 12) - (totalCapex * 0.015);

    // Tiempo de retorno simple (Payback)
    const paybackYears = annualSavingsNet > 0 ? (totalCapex / annualSavingsNet) : 0;

    // Nombres legibles de tarifas comerciales/residenciales
    const tariffNames = {
        'BT5B_RES': 'Tarifa Residencial (Hogar)',
        'BT5B_COM': 'Tarifa Comercial BT5B (Negocio)',
        'BT4': 'Tarifa Especial BT4 (Demanda Controlada)',
        'MT4': 'Tarifa Media Tensión MT4 (Industrial)'
    };
    const friendlyTariff = tariffNames[tariffCode] || tariffCode;

    // Actualizar elementos DOM
    const elKwh = document.getElementById('calcKwh');
    const elKwp = document.getElementById('calcKwp');
    const elPanels = document.getElementById('calcPanels');
    const elSavings = document.getElementById('calcSavings');
    const elInvestment = document.getElementById('calcInvestment');
    const elPayback = document.getElementById('calcPayback');
    const elMessage = document.getElementById('lossMessage');

    if (elKwh) elKwh.textContent = Math.round(monthlyKwh).toLocaleString('es-PE') + ' kWh';
    if (elKwp) elKwp.textContent = systemSizeKwp.toFixed(2) + ' kWp';
    if (elPanels) elPanels.textContent = panelsNeeded + ' paneles';
    if (elSavings) elSavings.textContent = formatSoles(monthlySavings);
    if (elInvestment) elInvestment.textContent = formatSoles(totalCapex);
    if (elPayback) elPayback.textContent = paybackYears > 0 ? paybackYears.toFixed(1) + ' años' : '0 años';

    if (elMessage) {
        elMessage.textContent = 'En la zona de ' + region + ' (' + hsp.toFixed(1) + ' HSP) bajo la ' + friendlyTariff + ', se requiere un sistema de ' + systemSizeKwp.toFixed(1) + ' kWp (' + panelsNeeded + ' paneles) con inversión referencial de ' + formatSoles(totalCapex) + ' para ahorrar ' + formatSoles(monthlySavings) + ' al mes.';
    }

    if (calculatorWhatsapp) {
        const text = 'Hola, pago S/ ' + monthlyBill.toLocaleString('es-PE') + ' al mes de luz en ' + region + ' (' + friendlyTariff + '). Según la calculadora en línea conectada al servidor, consumiría ' + Math.round(monthlyKwh) + ' kWh, requiero un sistema solar de ' + systemSizeKwp.toFixed(1) + ' kWp (' + panelsNeeded + ' paneles) con una inversión estimada de ' + formatSoles(totalCapex) + ' y un retorno de ' + (paybackYears > 0 ? paybackYears.toFixed(1) : '0') + ' años. Quiero cotizar el proyecto.';
        calculatorWhatsapp.href = 'https://wa.me/51934724576?text=' + encodeURIComponent(text);
    }
}

// Intentar cargar la configuración en tiempo real desde el servidor de base de datos de la empresa
async function fetchCalculatorConfig() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/public/calculator-config', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.tariffs && data.tariffs.length > 0) {
                calculatorConfig = data;
                console.log('Configuración de la calculadora cargada en tiempo real desde el servidor central.');
            }
        }
    } catch (e) {
        console.warn('Servidor central offline. Usando pliego tarifario local precargado de ELSE y precios de inventario en caché.');
    } finally {
        updateLossEstimate();
    }
}

// Configurar escuchadores
[billAmount, calcRegion, calcUserType].forEach(el => {
    if (el) el.addEventListener('change', updateLossEstimate);
    if (el) el.addEventListener('input', updateLossEstimate);
});

// Arrancar cargando configuración en tiempo real
fetchCalculatorConfig();

// Modal "Cómo Iniciar"
const btnComoIniciar = document.getElementById('btnComoIniciar');
const modalComoIniciar = document.getElementById('modalComoIniciar');
const modalClose = document.getElementById('modalClose');

if (btnComoIniciar && modalComoIniciar && modalClose) {
    btnComoIniciar.addEventListener('click', function(e) {
        e.preventDefault();
        modalComoIniciar.classList.add('active');
    });
    modalClose.addEventListener('click', function() {
        modalComoIniciar.classList.remove('active');
    });
    modalComoIniciar.addEventListener('click', function(e) {
        if (e.target === modalComoIniciar) {
            modalComoIniciar.classList.remove('active');
        }
    });
}

const quizBusiness = document.getElementById('quizBusiness');
const quizBill = document.getElementById('quizBill');
const quizDistrict = document.getElementById('quizDistrict');
const quizSchedule = document.getElementById('quizSchedule');
const quizLoads = document.getElementById('quizLoads');
const quizPreview = document.getElementById('quizPreview');
const quizWhatsapp = document.getElementById('quizWhatsapp');

function updateQuizMessage() {
    if (!quizBusiness || !quizBill || !quizDistrict || !quizSchedule || !quizLoads || !quizPreview || !quizWhatsapp) return;

    const business = quizBusiness.value;
    const bill = formatSoles(Math.max(Number(quizBill.value) || 0, 0));
    const district = quizDistrict.value.trim() || 'por definir';
    const schedule = quizSchedule.value;
    const loads = quizLoads.value.trim() || 'por detallar';
    const message = 'Hola, quiero cotizar paneles solares. Tipo de negocio: ' + business + '. Recibo aproximado: ' + bill + '. Distrito/zona: ' + district + '. Horario de mayor consumo: ' + schedule + '. Equipos: ' + loads + '.';

    quizPreview.textContent = message;
    quizWhatsapp.href = 'https://wa.me/51934724576?text=' + encodeURIComponent(message);
}

[quizBusiness, quizBill, quizDistrict, quizSchedule, quizLoads].forEach(function (field) {
    if (!field) return;
    field.addEventListener('input', updateQuizMessage);
    field.addEventListener('change', updateQuizMessage);
});

updateQuizMessage();
