/**
 * ReguGuard AI - Firebase Configuration
 * 
 * DEMO MODE: When Firebase is not configured (placeholder keys),
 * the app runs in demo mode with simulated auth.
 * 
 * To enable real Firebase:
 * Replace the config values below with your Firebase project credentials.
 * Get these from: Firebase Console → Project Settings → General → Your apps
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Detect demo mode (no real Firebase credentials)
const IS_DEMO_MODE = firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey;

let auth, db;

if (!IS_DEMO_MODE) {
  // Initialize real Firebase
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  console.log('[ReguGuard] Firebase initialized (live mode)');
} else {
  console.log('[ReguGuard] Running in DEMO MODE — Firebase not configured');
  
  // Create mock auth and db objects for demo mode
  const demoUser = {
    uid: 'demo-user-001',
    email: 'demo@reguguard.ai',
    displayName: 'Alex Johnson',
    photoURL: null
  };

  // Mock auth
  auth = {
    currentUser: null,
    _listeners: [],
    onAuthStateChanged(callback) {
      this._listeners.push(callback);
      // Check if user is "logged in" via sessionStorage
      if (sessionStorage.getItem('reguguard_demo_auth')) {
        this.currentUser = demoUser;
        setTimeout(() => callback(demoUser), 100);
      } else {
        setTimeout(() => callback(null), 100);
      }
    },
    signInWithEmailAndPassword(email, password) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.currentUser = { ...demoUser, email, displayName: email.split('@')[0] };
          sessionStorage.setItem('reguguard_demo_auth', 'true');
          this._listeners.forEach(cb => cb(this.currentUser));
          resolve({ user: this.currentUser });
        }, 800);
      });
    },
    createUserWithEmailAndPassword(email, password) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.currentUser = { ...demoUser, email, displayName: email.split('@')[0] };
          this.currentUser.updateProfile = (data) => {
            if (data.displayName) this.currentUser.displayName = data.displayName;
            return Promise.resolve();
          };
          sessionStorage.setItem('reguguard_demo_auth', 'true');
          this._listeners.forEach(cb => cb(this.currentUser));
          resolve({ user: this.currentUser });
        }, 800);
      });
    },
    signInWithPopup(provider) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.currentUser = { ...demoUser };
          sessionStorage.setItem('reguguard_demo_auth', 'true');
          this._listeners.forEach(cb => cb(this.currentUser));
          resolve({ user: this.currentUser });
        }, 800);
      });
    },
    signOut() {
      return new Promise((resolve) => {
        this.currentUser = null;
        sessionStorage.removeItem('reguguard_demo_auth');
        this._listeners.forEach(cb => cb(null));
        resolve();
      });
    }
  };

  // Mock Firestore
  const _mockStore = {};
  db = {
    collection(name) {
      if (!_mockStore[name]) _mockStore[name] = {};
      return {
        doc(id) {
          return {
            set(data, options) {
              _mockStore[name][id] = { ..._mockStore[name][id], ...data };
              return Promise.resolve();
            },
            get() {
              return Promise.resolve({
                exists: !!_mockStore[name][id],
                data: () => _mockStore[name][id] || {}
              });
            }
          };
        },
        add(data) {
          const id = 'doc_' + Date.now();
          _mockStore[name][id] = data;
          return Promise.resolve({ id });
        },
        where() { return this; },
        get() {
          const docs = Object.entries(_mockStore[name] || {}).map(([id, data]) => ({
            id,
            data: () => data
          }));
          return Promise.resolve({ docs });
        }
      };
    }
  };



  // Mock FieldValue
  window.firebase = window.firebase || {};
  firebase.firestore = firebase.firestore || {};
  firebase.firestore.FieldValue = {
    serverTimestamp() { return new Date().toISOString(); }
  };
}
