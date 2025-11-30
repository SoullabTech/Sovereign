/**
 * Kelly Identity Setter
 * Run this script to properly set Kelly's identity in MAIA
 */

// Set Kelly's identity in localStorage
localStorage.setItem('explorerName', 'Kelly');
localStorage.setItem('explorerId', 'kelly-nezat');
localStorage.setItem('betaOnboardingComplete', 'true');

console.log('🌟 Kelly identity set successfully!');
console.log('🔄 Reloading page to apply changes...');

// Reload the page to apply changes
window.location.reload();