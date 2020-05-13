const params_arr = [
    "concrete_volume",
    "days_per_floor",
    "floor_area",
    "floor_number",
    "crane_number",
    "workers_under_crane"
]

const result_arr = [
    "saving",
    "invest",
    "profit",
]

currentVersion = 2;
applicationName = 'formWorks';

$(document).ready(function (e) {
    update_result()
});

function checkVersion() {
    const version = localStorage.getItem('psaFormWorksV');
    if (!(version && version == currentVersion))
        return false;

    return true;
}

function getDataObject(name) {
    if (!(typeof name === 'string' || name instanceof String))
        return null;

    if (!checkVersion())
        return null;

    const str = localStorage.getItem(name);
    if (!(typeof str === 'string' || str instanceof String))
        return null;

    return JSON.parse(str);
}

function update_result() {
    const params = getDataObject('psaFormWorksParams');
    const results = getDataObject('psaFormWorksResult');;

    if (!(is_data_ready(params, params_arr) && is_results_ready(results, result_arr))) {
        reset_results();
        return;
    }

    set_results(results);
}

function is_data_ready(data, prop_arr) {
    for (const prop in prop_arr) {
        if (data[prop])
            continue;

        return false;
    }
    return true;
}

function reset_results() {
    $('#saving').text('----');
    $('#invest').text('----');
    $('#profit').text('----');
}

function set_results(results) {
    $('#saving').text(Math.round(results.saving).toLocaleString('ru') + ' Руб');
    $('#invest').text(Math.round(results.invest).toLocaleString('ru') + ' Руб');
    $('#profit').text(Math.round(results.profit).toLocaleString('ru') + ' Руб');
}