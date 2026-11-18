// Asistan Portal — bildirim servis çalışanı (Firebase Cloud Messaging)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:"AIzaSyDq5QeeQHanwZ3IADV9zuqY4SMcxjgoug0",authDomain:"anastezi-portal.firebaseapp.com",projectId:"anastezi-portal",storageBucket:"anastezi-portal.firebasestorage.app",messagingSenderId:"934699918960",appId:"1:934699918960:web:520866d6c6b50ff18ab6b5"});
firebase.messaging();
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
