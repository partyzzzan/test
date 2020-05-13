const ids = {
  concrete_volume_id: '1361571',
  days_per_floor_id: '1361583',
  floor_area_id: '1361584',
  floor_number_id: '1361586',
  crane_number_id: '1361587',
  workers_under_crane_id: '1361589'
}

currentVersion = 2;
applicationName = 'formWorks';

const days_per_month = 30;
const toolset_cost = 526000;
const worker_daily_salary = 1500;
const crane_monthly_rental_fee = 500000;
const shack_number = 10;
const shack_monthly_rental_fee = 6000;
const other_daily_cost = 1000;
const speedup = (1 - 0.9531);

const profit_text = 
`Получите выгоду, показанную ниже, за счет 
использования строительных технологий Хилти.
Так же Вы сможете быстрее завершить работы на объекте,
не увеличивая количество рабочих, и подписать акты 
о стоимости и приемке выполненых работ (формы КС).
А значит быстрее получить свои деньги.`;

// `Начните использовать строительные технологии 
// Хилти и без увеличения фонда оплаты труда 
// Вы сможете сэкономить рассчитаную сумму. 
// А также быстрее завершить работы на 
// объекте и подписать акт о приемке выполненых работ (формы КС).
// А значит быстрее получить свои деньги.`;

const input_text = ``;

const fail_text = 
`На основании введенных данных Ваша компания
работает достаточно эффективно. 
Узнайте, какие улучшения строительных 
процессов, которые мы предлагаем, 
Вы пока не используете`;

$(document).ready(function (e) {
  if(tryToRecoverData())
    update_result()
  else
    reset_results();

  
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

function tryToRecoverData()
{
  const version = localStorage.getItem('psaFormWorksV');
  if(!(version && version == currentVersion))
    return false;

  const prmString = localStorage.getItem('psaFormWorksParams');
  if(!prmString)
    return false;

  const params = JSON.parse(prmString);
  if(!params)
    return false;

  res = true;
  for (const prop in ids) {
    const value = params[prop.substring(0, prop.lastIndexOf("_id"))];
    if(value)
      $('#id123-control' + ids[prop]).val(value);
    else
      res = false;
  }
  return res;
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

  const workers_daily_cost = worker_daily_salary * params.workers_under_crane * params.crane_number;
  const crane_daily_cost = crane_monthly_rental_fee / days_per_month;
  const shack_daily_cost = shack_number * shack_monthly_rental_fee / days_per_month;
  const total_site_daily_cost = workers_daily_cost + crane_daily_cost + shack_daily_cost + other_daily_cost;
  const saved_days_per_floor = speedup * params.days_per_floor;
  const total_saved_days = saved_days_per_floor * params.floor_number;

  const saving = total_saved_days * total_site_daily_cost;
  const invest = toolset_cost * params.crane_number;
  const profit = saving - invest;

  localStorage.setItem('psaFormWorksResult', JSON.stringify({saving: saving, invest: invest, profit: profit}));

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
    if (params[prop]) {
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
  if(profit > 0)
  {
    $('#saving').text(Math.round(saving).toLocaleString('ru'));
    $('#invest').text(Math.round(invest).toLocaleString('ru'));
    $('#profit').text(Math.round(profit).toLocaleString('ru'));

    $('#profit-description-text').text(profit_text);
  }
  else
  {
    $('#saving').text('—');
    $('#invest').text('—');
    $('#profit').text('—');
  
    $('#profit-description-text').text(fail_text);
  }
}