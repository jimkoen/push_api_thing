self.addEventListener('push', function(event) {
    event.waitUntil(
        self.registration.showNotification('GKM Team Bunt', {
            body: 'Hey, eine Notification!',
        })
    );
});
