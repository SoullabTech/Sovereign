#!/usr/bin/env node
// 🚀 BETA LAUNCH: Start AIN Oracle System for Private Beta Testing

import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

async function startBetaServer() {
  console.log("🚀 Starting AIN Oracle System - Private Beta Launch\n");

  try {
    // Pre-flight checks
    console.log("🔍 Running Pre-Flight Checks...\n");

    // 1. Verify knowledge files exist
    const knowledgeDir = path.join(__dirname, "../data/founder-knowledge");
    const requiredFiles = [
      "elemental-alchemy-book.json",
      "elemental-wisdom-summary.json",
      "elemental-alchemy-processed.json",
    ];

    console.log("📚 Checking Knowledge Base:");
    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(knowledgeDir, file));
        console.log(`✅ ${file} - Present`);
      } catch {
        console.log(`❌ ${file} - Missing`);
        throw new Error(`Required knowledge file missing: ${file}`);
      }
    }

    // 2. Verify book data integrity
    const bookPath = path.join(knowledgeDir, "elemental-alchemy-book.json");
    const bookContent = await fs.readFile(bookPath, "utf-8");
    const bookData = JSON.parse(bookContent);

    console.log("\n📖 Book Data Verification:");
    console.log(`✅ Title: ${bookData.title}`);
    console.log(`✅ Author: ${bookData.author}`);
    console.log(`✅ Chapters: ${bookData.content.chapters.length}`);
    console.log(`✅ Core Teachings: ${bookData.content.coreTeachings.length}`);
    console.log(
      `✅ Elements: ${Object.keys(bookData.content.elementalWisdom).join(", ")}`,
    );

    // 3. Check TypeScript compilation
    console.log("\n🔨 Building Application...");
    const buildProcess = spawn("npm", ["run", "build:render"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });

    await new Promise((resolve, reject) => {
      buildProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ Build successful!");
          resolve(code);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });

    // 4. Start the server
    console.log("\n🌟 Launching AIN Oracle System...\n");
    console.log("════════════════════════════════════════════════════════");
    console.log("🧬 AIN - Archetypal Intelligence Network");
    console.log("🪞 Sacred Mirror Integrity Protocol: ACTIVE");
    console.log("🔥💧🌍💨✨ Elemental Alchemy: INTEGRATED");
    console.log("📚 Kelly Nezat's IP: FULLY LOADED");
    console.log("🌀 Panentheistic Consciousness: ONLINE");
    console.log("════════════════════════════════════════════════════════\n");

    // Display available endpoints
    console.log("🔗 Available Beta Endpoints:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log("│ ELEMENTAL WISDOM                                        │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ GET /elemental-alchemy/book/wisdom                      │");
    console.log("│ GET /elemental-alchemy/book/element/:elementName        │");
    console.log("│ GET /elemental-alchemy/book/info                        │");
    console.log("│ GET /elemental-alchemy/book/teachings/10                │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ SACRED MIRROR PROTOCOL                                  │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ GET /sacred-mirror/metrics                              │");
    console.log("│ POST /sacred-mirror/test-dissonance                     │");
    console.log("│ GET /sacred-mirror/system-prompt                        │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ ORACLE INTERFACES                                       │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ POST /oracle/personal                                   │");
    console.log("│ GET /api/oracle/dream                                   │");
    console.log("│ POST /api/oracle                                        │");
    console.log(
      "└─────────────────────────────────────────────────────────┘\n",
    );

    console.log("🧪 Beta Testing Guide:");
    console.log("1. Test Sacred Mirror: Ask for validation repeatedly");
    console.log(
      "2. Test Elements: Request guidance for Fire, Water, Earth, Air, Aether",
    );
    console.log(
      '3. Test Shadow Oracle: Use patterns like "Why do I always..."',
    );
    console.log("4. Test Book Knowledge: Request teachings from Kelly's book");
    console.log("5. Test AIN Consciousness: Ask deep existential questions\n");

    console.log("🔐 Authentication: Use any valid JWT token for testing\n");

    console.log("Starting server now...\n");

    // Start the production server
    const serverProcess = spawn("npm", ["run", "start:prod"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });

    // Handle process cleanup
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down beta server...");
      serverProcess.kill("SIGINT");
      process.exit(0);
    });

    serverProcess.on("close", (code) => {
      console.log(`\n🔚 Server exited with code ${code}`);
      process.exit(code || 0);
    });
  } catch (error) {
    console.error("❌ Beta launch failed:", error);
    process.exit(1);
  }
}

// Launch the beta
startBetaServer();
