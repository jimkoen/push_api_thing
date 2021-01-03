navigator.serviceWorker.register('https://push.i7.si/service-worker.js');

function addSeconds(date, seconds){
    return new Date(date.getTime + seconds * 1000);
}
navigator.serviceWorker.ready
    .then(function (registration) {
        // Use the PushManager to get the user's subscription to the push service.
        return registration.pushManager.getSubscription()
            .then(async function (subscription) {
                // If a subscription was found, return it.
                if (subscription) {
                    return subscription;
                }

                // Get the server's public key
                const response = await fetch('./vapidPublicKey');
                const vapidPublicKey = await response.text();
                // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
                // urlBase64ToUint8Array() is defined in /tools.js
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
                // send notifications that don't have a visible effect for the user).
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            });
    }).then(function (subscription) {
    //console.log(JSON.stringify(subscription));
    // Send the subscription details to the server using the Fetch API.




    document.getElementById('button_register').onclick = function () {
        const product = document.getElementById('product').value;
        const timestamp = document.getElementById('timestamp').value;

        // Ask the server to send the client a notification (for testing purposes, in actual
        // applications the push notification is likely going to be generated by some event
        // in the server).
        let requestBody = {
            product: JSON.stringify(product),
            timestamp: JSON.stringify(timestamp),
            subscription: subscription
        }

        let debugInfo = document.createTextNode(JSON.stringify(requestBody));
        let subscriptionInfo = document.createTextNode(JSON.stringify(requestBody.subscription));
        document.body.appendChild(document.createElement('p').appendChild(debugInfo));
        document.body.appendChild(document.createElement('p').appendChild(subscriptionInfo));

        console.log(requestBody);


        fetch('./subscription', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                    product: product.toString(),
                    timestamp: Number(addSeconds(new Date(), 5).getTime()),
                    subscription: subscription
                }),
        });
    };

});
