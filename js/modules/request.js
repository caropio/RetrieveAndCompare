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
                GUI.displayModalWindow('Network error',
                    `Please check your internet connection.\n\n
                     If you are not online, the data is lost and we can\'t pay you. :(`, 'error');
            }

        }

    });
}

// TODO: USE AXIOS INSTEAD OF JQUERY
// the latter code is not working (inserts 0 values in the database)
//export function sendToDB(call, data, url) {
//    axios.post(url, data)
//        .then(response => {
//            const r = response.data;
//            if (r.error > 0 && (call + 1) < MAX_REQUESTS) {
//                sendToDB(call + 1, data, url);
//            }
//        })
//        .catch(error => {
//            if ((call + 1) < MAX_REQUESTS) {
//                sendToDB(call + 1, data, url);
//            } else {
//                GUI.displayModalWindow('Network error',
//                    `Please check your internet connection.\n\n
//           If you are not online, the data is lost and we can\'t pay you. :(`, 'error');
//            }
//        });
//}
// proper way to use axios: