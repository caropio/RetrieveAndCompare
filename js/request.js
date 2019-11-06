export function sendToDB(call, data, url) {

    $.ajax({
        type: 'POST',
        data: data,
        async: true,
        url: url,
        success: function (r) {

            if (r[0].ErrorNo > 0 && (call + 1) < 2) {
                sendToDB(call + 1);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if ((call + 1) < 2) {
                sendToDB(call + 1);
            }
        }
    });
}
