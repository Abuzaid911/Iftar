export async function subscribeToPushNotifications() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // Register service worker and subscribe to push notifications
    }
  }
}