import {GUI} from './gui.js'


export function sendToDB(call, data, url) {

    $.ajax({
        type: 'POST',
        data: data,
        async: true,
        url: url,
        success: function (r) {

            if (r.error > 0 && (call + 1) < 5) {
                sendToDB(call + 1);
            }
            alert(r);
            alert(r.error);
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if ((call + 1) < 5) {
                sendToDB(call + 1);
            }

            GUI.displayModalWindow('Network error',
                '' + XMLHttpRequest + ' ' + textStatus + ' ' + errorThrown, 'error');
        }
    });
}
