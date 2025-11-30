import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Spiralogic Oracle API",
      version: "1.0.0",
      description: "Documentation for Spiralogic Oracle API endpoints",
    },
  },
  apis: ["./src/routes/*.ts"], // Pull JSDoc comments from route files
});
