export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator)) {
    alert("Service workers are not supported in this browser");
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notification permission denied");
    return;
  }

  const vapidPublicKey = "BCLx5evisJ4zIzaG-jni6vv5hEFMy0NqVYzPJxw6BmnjskgH-aUYV-hmRMnxyq7xoe_PI0MPw7IdjkL2dRSIpE8";

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Send to backend
  await fetch("http://localhost:8080/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  console.log(" Subscribed successfully:", subscription);
}
