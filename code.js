const ids = {
  concrete_volume_id: '1361571',
  days_per_floor_id: '1361583',
  floor_area_id: '1361584',
  floor_number_id: '1361586',
  crane_number_id: '1361587',
  workers_under_crane_id: '1361589'
}

currentVersion = 3;
applicationName = 'formWorks';

const FMIN = 1;
const PMIN = 1;
const CMIN = 1;

const WC = 2000;
const CR = 700000;
const CH = 6000;
const QWH = 4;
const CU = 100000;

const SUK = 0.953;

const TP1 = 160000;
const TQ1 = 1

const TP2 = 65000;
const TQ2 = 1;

const TP3 = 63000;
const TQ3 = 1;

const CP1 = 5;
const CN1 = 16;

const CP2 = 190;
const CN2 = 0.006667

const profit_text =
  `Получите выгоду, показанную ниже, за счет 
использования строительных технологий Hilti.
Так же вы сможете быстрее завершить работы на объекте,
не увеличивая количество рабочих, и подписать акты 
о стоимости и приемке выполненых работ (формы КС).
А значит, быстрее получить свои деньги.`;

const input_text = ``;

const fail_text =
  `На основании введенных данных ваша компания
работает достаточно эффективно. 
Узнайте, какие улучшения строительных 
процессов, которые мы предлагаем, 
вы пока не используете`;

$(document).ready(function (e) {
  if (tryToRecoverData())
    update_result()
  else
    reset_results();


    fetch("https://www.hilti.ru/userDetails.json", 
          {
            method: "GET", 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json',}
          })
      .then((r) => { return r.json(); })
      .then((data) => { console.log('success', JSON.stringify(data)); })
      .catch((error) => { console.error("error", error); });

  for (const prop in ids) {
    if ($('#id123-control' + ids[prop]).length != 0)
      continue;
    console.error('Control with id ' + ids[prop] + ' not found');
    return;
  }

  for (const prop in ids) {
    $('#id123-control' + ids[prop]).on('keyup change', function (event) {
      update_result();
    });
  }
});

function tryToRecoverData() {
  const version = localStorage.getItem('psaFormWorksV');
  if (!(version && version == currentVersion))
    return false;

  const prmString = localStorage.getItem('psaFormWorksParams');
  if (!prmString)
    return false;

  const params = JSON.parse(prmString);
  if (!params)
    return false;

  res = true;
  for (const prop in ids) {
    const value = params[prop.substring(0, prop.lastIndexOf("_id"))];
    if (value)
      $('#id123-control' + ids[prop]).val(value);
    else
      res = false;
  }
  return res;
}

function FCAL(params) {
  return Math.max(FMIN, params.floor_number);
}

function PCAL(params) {
  return Math.max(PMIN, params.workers_under_crane);
}

function CCAL(params) {
  return Math.max(CMIN, params.crane_number);
}

function DC(params) {
  const TWC = WC * PCAL(params) * CCAL(params);
  const CRD = CR / 30 * CCAL(params);
  const QH = PCAL(params) / QWH * CCAL(params);
  const CHD = CH * QH + CU;
  const HD = CHD / 30;
  return TWC + CRD + HD;
}

function FFD(params) {
  return params.days_per_floor * (1 - SUK);
}

function DFP(params) {
  return FFD(params) * FCAL(params);
}

function HTC() {
  return TP1 * TQ1 + TP2 * TQ2 + TP3 * TQ3;
}

function HTPC(params) {
  return HTC() * CCAL(params);
}

function HCPC(params) {
  return (CN1 * params.concrete_volume * CP1) + (CN2 * FCAL(params) * params.floor_area * CP2);
}

function HPC(params) {
  return HTPC(params) + HCPC(params);
}

function update_result() {
  const params = get_params();

  if (!is_params_ready(params)) {
    reset_results();
    return;
  }

  localStorage.setItem('psaFormWorksParams', JSON.stringify(params));
  localStorage.setItem('psaFormWorksDt', Date.now());
  localStorage.setItem('psaFormWorksV', currentVersion);

  const saving = DFP(params) * DC(params);
  const invest = HPC(params);
  const profit = saving - invest;

  localStorage.setItem('psaFormWorksResult', JSON.stringify({
    saving: saving,
    invest: invest,
    profit: profit
  }));

  set_results(saving, invest, profit);
}

function get_params() {
  let params = {};
  for (const prop in ids) {
    const value = parseFloat($('#id123-control' + ids[prop]).val());
    const indexOfSuffix = prop.lastIndexOf("_id");
    const propName = prop.substring(0, indexOfSuffix);
    params[propName] = value;
  }
  return params;
}

function is_params_ready(params) {
  for (const prop in params) {
    if (params[prop] !== undefined && !isNaN(params[prop])) {
      continue;
    }
    return false;
  }
  return true;
}

function reset_results() {
  $('#saving').text('—');
  $('#invest').text('—');
  $('#profit').text('—');

  $('#profit-description-text').text(input_text);
}

function set_results(saving, invest, profit) {
  if (profit > 0) {
    $('#saving').text(Math.round(saving).toLocaleString('ru'));
    $('#invest').text(Math.round(invest).toLocaleString('ru'));
    $('#profit').text(Math.round(profit).toLocaleString('ru'));

    $('#profit-description-text').text(profit_text);
  } else {
    $('#saving').text('—');
    $('#invest').text('—');
    $('#profit').text('—');

    $('#profit-description-text').text(fail_text);
  }
}