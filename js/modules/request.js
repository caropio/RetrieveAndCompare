import {GUI} from './gui.js'

const MAX_REQUESTS = 3;

export function sendToDB(call, data, url) {
    $.ajax({
        type: 'POST',
        data: data,
        async: true,
        url: url,
        success: function (r) {

            if (r.error > 0 && (call + 1) < MAX_REQUESTS) {
                sendToDB(call + 1);
            }
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if ((call + 1) < MAX_REQUESTS) {
                sendToDB(call + 1);
            } else {
                GUI.displayModalWindow('Network error', 'Please contact us on prolific.', 'error');
            }

        }

    });
}
