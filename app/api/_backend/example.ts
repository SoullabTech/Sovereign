// A simple function that takes a name and returns a greeting message
function greet(name: string): string {
  if (!name || name.trim() === "") {
    throw new Error("Name cannot be empty");
  }
  return `Hello, ${name}! Welcome to TypeScript.`;
}

// Example usage with error handling
try {
  const userName = "Alice";
  console.log(greet(userName)); // Output: Hello, Alice! Welcome to TypeScript.

  // Uncomment to test error handling:
  // console.log(greet(''));  // Will throw an error
} catch (error) {
  console.error(
    "Error:",
    error instanceof Error ? error.message : "An unexpected error occurred",
  );
}

// Export the function for potential reuse
export { greet };
