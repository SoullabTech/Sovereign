// Script to restore user identity
console.log('🔧 Restoring user identity...');

// Check current localStorage
console.log('Current localStorage state:');
console.log('explorerId:', localStorage.getItem('explorerId'));
console.log('explorerName:', localStorage.getItem('explorerName'));
console.log('betaUserId:', localStorage.getItem('betaUserId'));
console.log('beta_user:', localStorage.getItem('beta_user'));

// Set proper user identity (adjust these values as needed)
localStorage.setItem('explorerId', 'soullab');
localStorage.setItem('explorerName', 'Soullab');
localStorage.setItem('betaOnboardingComplete', 'true');

// Clear any guest session data
localStorage.removeItem('guest_session');
localStorage.removeItem('maia_session_id');

console.log('✅ User identity restored!');
console.log('New explorerId:', localStorage.getItem('explorerId'));
console.log('New explorerName:', localStorage.getItem('explorerName'));
console.log('Please refresh the page to see the changes.');
