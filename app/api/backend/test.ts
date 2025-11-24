// A simple TypeScript test file demonstrating basic functionality
console.log("Hello, TypeScript!");

// Example of type safety
function add(a: number, b: number): number {
  return a + b;
}

// Test the function
const result = add(5, 3);
console.log(`5 + 3 = ${result}`);

// Export for potential use in other files
export { add };
