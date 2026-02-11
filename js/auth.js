const auth = firebase.auth();
const db = firebase.firestore();

const DASHBOARD_PATH = 'dashboard.html';
const LOGIN_PATH = 'login.html';

async function signupUser(email, password) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  const now = firebase.firestore.FieldValue.serverTimestamp();

  await db.collection('users').doc(uid).set({
    xp: 0,
    level: 1,
    streak: 0,
    mlCoins: 0,
    tokens: 0,
    createdAt: now,
    lastLogin: now
  });

  window.location.href = DASHBOARD_PATH;
}

async function loginUser(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  await db.collection('users').doc(uid).set(
    { lastLogin: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  window.location.href = DASHBOARD_PATH;
}

async function logoutUser() {
  await auth.signOut();
  window.location.href = LOGIN_PATH;
}

function protectPage() {
  auth.onAuthStateChanged(user => {
    const path = window.location.pathname;
    const onLogin = path.endsWith('login.html');
    const onSignup = path.endsWith('signup.html');

    if (!user && !onLogin && !onSignup) {
      window.location.href = LOGIN_PATH;
    }
  });
}

function getCurrentUser() {
  return auth.currentUser;
}
