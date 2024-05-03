const notification = {
    send: function (message) {
        if (!("Notification" in window)) {
            // si les notifications ne sont pas supportées par le navigateur
            console.error("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            // les notifications sont autorisées, on envoie la notif !
            const notif = new Notification(message);
        } else if (Notification.permission !== "denied") {
            // demande d'autorisation à faire
            Notification.requestPermission().then((permission) => {
                // demande acceptée, on envoie la notif !
                if (permission === "granted") {
                    const notif = new Notification(message);
                }
            });
        }
    }
};