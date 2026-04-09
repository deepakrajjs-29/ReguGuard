/**
 * ReguGuard AI - Authentication Module
 * Handles email/password and Google sign-in, route protection, and session management.
 * Supports both live Firebase and demo mode.
 */

const Auth = (() => {
  const PROTECTED_PAGES = ['dashboard.html', 'compliance.html', 'reports.html', 'settings.html'];

  /**
   * Initialize auth state observer - call on every page load
   */
  function init() {
    auth.onAuthStateChanged((user) => {
      const currentPage = _getCurrentPage();

      if (user) {
        console.log('[Auth] User signed in:', user.email || user.displayName);
        _updateUI(user);
        
        // In live mode, save to Firestore
        if (!IS_DEMO_MODE) {
          _saveUserToFirestore(user);
        }
        
        // Redirect from login page to dashboard
        if (currentPage === 'login.html') {
          window.location.href = 'dashboard.html';
        }
      } else {
        console.log('[Auth] No user signed in');
        
        // Redirect from protected page to login
        if (PROTECTED_PAGES.includes(currentPage)) {
          window.location.href = 'login.html';
        }
      }
    });
  }

  /**
   * Get current page filename
   */
  function _getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    // Handle cases like /dashboard (no .html) or /dashboard.html
    if (!page || page === '' || page === '/') return 'index.html';
    if (!page.includes('.')) return page + '.html';
    return page;
  }

  /**
   * Sign up with email and password
   */
  async function signUp(email, password, displayName) {
    try {
      _showLoading(true, 'Creating your account...');
      const credential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Update display name
      if (displayName && credential.user.updateProfile) {
        await credential.user.updateProfile({ displayName });
      }

      if (IS_DEMO_MODE) {
        // In demo mode, manually update the user object
        if (auth.currentUser) auth.currentUser.displayName = displayName;
      }

      Toast.show('Account created successfully! Welcome to ReguGuard.', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
      
      return credential.user;
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      Toast.show(_getErrorMessage(error.code), 'error');
      throw error;
    } finally {
      _showLoading(false);
    }
  }

  /**
   * Sign in with email and password
   */
  async function signIn(email, password) {
    try {
      _showLoading(true, 'Signing you in...');
      const credential = await auth.signInWithEmailAndPassword(email, password);
      Toast.show('Welcome back! Signed in successfully.', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
      
      return credential.user;
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      Toast.show(_getErrorMessage(error.code), 'error');
      throw error;
    } finally {
      _showLoading(false);
    }
  }

  /**
   * Sign out
   */
  async function signOut() {
    try {
      await auth.signOut();
      Toast.show('Signed out successfully.', 'info');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      Toast.show('Error signing out. Please try again.', 'error');
    }
  }

  /**
   * Get current user
   */
  function getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Check if user is logged in (synchronous check)
   */
  function isLoggedIn() {
    return !!auth.currentUser || !!sessionStorage.getItem('reguguard_demo_auth');
  }

  /**
   * Save/update user data in Firestore
   */
  async function _saveUserToFirestore(user) {
    try {
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[Auth] Error saving user data:', error);
    }
  }

  /**
   * Update sidebar user UI elements on all pages
   */
  function _updateUI(user) {
    const nameEls = document.querySelectorAll('.js-user-name');
    const emailEls = document.querySelectorAll('.js-user-email');
    const avatarEls = document.querySelectorAll('.js-user-avatar');

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    nameEls.forEach(el => el.textContent = displayName);
    emailEls.forEach(el => el.textContent = user.email || 'demo@reguguard.ai');
    avatarEls.forEach(el => el.textContent = initials);
  }

  /**
   * Show/hide loading overlay
   */
  function _showLoading(show, message) {
    let overlay = document.getElementById('loading-overlay');
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `<div class="spinner"></div><p style="color:#94a3b8;font-size:14px;">${message || 'Authenticating...'}</p>`;
        document.body.appendChild(overlay);
      } else {
        overlay.querySelector('p').textContent = message || 'Authenticating...';
      }
      overlay.style.display = 'flex';
    } else if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  function _getErrorMessage(code) {
    const messages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups and try again.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.'
    };
    return messages[code] || 'An unexpected error occurred. Please try again.';
  }

  return { init, signUp, signIn, signOut, getCurrentUser, isLoggedIn };
})();
