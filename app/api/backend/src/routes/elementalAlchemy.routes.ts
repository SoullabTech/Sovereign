import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { elementalAlchemyService } from "../services/elementalAlchemyService";
import { WebSocketServer } from "ws";
import { Server } from "http";
import fs from "fs/promises";
import path from "path";

export const elementalAlchemyRouter = Router();

// Get user's elemental alchemy state
elementalAlchemyRouter.get("/state", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userState = await elementalAlchemyService.getUserState(userId);
    const state = userState.holoflower.getState();
    const visualData = userState.holoflower.exportVisualizationData();

    res.json({
      success: true,
      data: {
        state,
        visualization: visualData,
        transformationHistory: userState.transformationHistory.slice(0, 10),
        insightHistory: userState.insightHistory.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching elemental alchemy state:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch elemental alchemy state",
    });
  }
});

// Update house intensity
elementalAlchemyRouter.post(
  "/house/:houseNumber/intensity",
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const houseNumber = parseInt(req.params.houseNumber);
      const { intensity } = req.body;

      if (houseNumber < 1 || houseNumber > 12) {
        return res.status(400).json({
          success: false,
          error: "Invalid house number. Must be between 1 and 12.",
        });
      }

      await elementalAlchemyService.updateHouseIntensity(
        userId,
        houseNumber,
        intensity,
      );

      res.json({
        success: true,
        message: "House intensity updated",
      });
    } catch (error) {
      console.error("Error updating house intensity:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update house intensity",
      });
    }
  },
);

// Activate transformation
elementalAlchemyRouter.post(
  "/transformation",
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const { fromHouse, toHouse } = req.body;

      if (fromHouse < 1 || fromHouse > 12 || toHouse < 1 || toHouse > 12) {
        return res.status(400).json({
          success: false,
          error: "Invalid house numbers. Must be between 1 and 12.",
        });
      }

      await elementalAlchemyService.activateTransformation(
        userId,
        fromHouse,
        toHouse,
      );

      res.json({
        success: true,
        message: "Transformation activated",
      });
    } catch (error) {
      console.error("Error activating transformation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to activate transformation",
      });
    }
  },
);

// Integrate phi spiral
elementalAlchemyRouter.post(
  "/integrate-phi",
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      await elementalAlchemyService.integratePhiSpiral(userId);

      res.json({
        success: true,
        message: "Phi spiral integration activated",
      });
    } catch (error) {
      console.error("Error integrating phi spiral:", error);
      res.status(500).json({
        success: false,
        error: "Failed to integrate phi spiral",
      });
    }
  },
);

// Get personal insights
elementalAlchemyRouter.get("/insights", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const insights =
      await elementalAlchemyService.generatePersonalInsights(userId);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate insights",
    });
  }
});

// Get transformation history
elementalAlchemyRouter.get(
  "/transformations",
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const userState = await elementalAlchemyService.getUserState(userId);

      res.json({
        success: true,
        data: userState.transformationHistory,
      });
    } catch (error) {
      console.error("Error fetching transformation history:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch transformation history",
      });
    }
  },
);

// Analyze group alchemy
elementalAlchemyRouter.post(
  "/group/:groupId/analyze",
  authenticate,
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const pattern =
        await elementalAlchemyService.analyzeGroupAlchemy(groupId);

      res.json({
        success: true,
        data: pattern,
      });
    } catch (error) {
      console.error("Error analyzing group alchemy:", error);
      res.status(500).json({
        success: false,
        error: "Failed to analyze group alchemy",
      });
    }
  },
);

// Get house details
elementalAlchemyRouter.get("/house/:houseNumber", async (req, res) => {
  try {
    const houseNumber = parseInt(req.params.houseNumber);

    if (houseNumber < 1 || houseNumber > 12) {
      return res.status(400).json({
        success: false,
        error: "Invalid house number. Must be between 1 and 12.",
      });
    }

    // Get house definition from the model
    const holoflower = new (
      await import("../core/ElementalAlchemyHoloflower")
    ).ElementalAlchemyHoloflower();
    const state = holoflower.getState();
    const house = state.houses.find((h) => h.number === houseNumber);

    if (!house) {
      return res.status(404).json({
        success: false,
        error: "House not found",
      });
    }

    res.json({
      success: true,
      data: {
        number: house.number,
        element: house.element,
        phase: house.phase,
        consciousnessLevel: house.consciousnessLevel,
        alchemicalProcess: house.alchemicalProcess,
        sacredSymbol: house.sacredSymbol,
        description: house.description,
        keywords: house.keywords,
        shadowAspect: house.shadowAspect,
        giftAspect: house.giftAspect,
      },
    });
  } catch (error) {
    console.error("Error fetching house details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch house details",
    });
  }
});

// Get all houses overview
elementalAlchemyRouter.get("/houses", async (req, res) => {
  try {
    const holoflower = new (
      await import("../core/ElementalAlchemyHoloflower")
    ).ElementalAlchemyHoloflower();
    const state = holoflower.getState();

    const houses = state.houses.map((house) => ({
      number: house.number,
      element: house.element,
      phase: house.phase,
      consciousnessLevel: house.consciousnessLevel,
      alchemicalProcess: house.alchemicalProcess,
      sacredSymbol: house.sacredSymbol,
      description: house.description,
    }));

    res.json({
      success: true,
      data: houses,
    });
  } catch (error) {
    console.error("Error fetching houses overview:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch houses overview",
    });
  }
});

// ========== ELEMENTAL ALCHEMY BOOK KNOWLEDGE ENDPOINTS ==========

/**
 * GET /elemental-alchemy/book/wisdom
 * Returns the elemental wisdom summary from Kelly's book
 */
elementalAlchemyRouter.get("/book/wisdom", authenticate, async (req, res) => {
  try {
    const summaryPath = path.join(
      __dirname,
      "../../data/founder-knowledge/elemental-wisdom-summary.json",
    );
    const content = await fs.readFile(summaryPath, "utf-8");
    const wisdom = JSON.parse(content);

    res.json({
      success: true,
      data: wisdom,
      message: "Elemental Alchemy book wisdom successfully retrieved",
    });
  } catch (error) {
    console.error("Error fetching elemental book wisdom:", error);
    res.status(404).json({
      success: false,
      error:
        "Elemental Alchemy book wisdom not found. Please run ingestion script first.",
      message: "Book knowledge not yet processed",
    });
  }
});

/**
 * GET /elemental-alchemy/book/element/:elementName
 * Returns specific element teachings from Kelly's book
 */
elementalAlchemyRouter.get(
  "/book/element/:elementName",
  authenticate,
  async (req, res) => {
    try {
      const { elementName } = req.params;
      const validElements = ["fire", "water", "earth", "air", "aether"];

      if (!validElements.includes(elementName.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: "Invalid element name",
          validElements,
        });
      }

      const summaryPath = path.join(
        __dirname,
        "../../data/founder-knowledge/elemental-wisdom-summary.json",
      );
      const content = await fs.readFile(summaryPath, "utf-8");
      const wisdom = JSON.parse(content);

      const elementWisdom = wisdom.elements[elementName.toLowerCase()];

      if (!elementWisdom) {
        return res.status(404).json({
          success: false,
          error: `${elementName} wisdom not found in book`,
        });
      }

      res.json({
        success: true,
        data: {
          element: elementName.toLowerCase(),
          source:
            "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life",
          author: "Kelly Nezat",
          ...elementWisdom,
          integration_principles: wisdom.integration_principles,
        },
      });
    } catch (error) {
      console.error("Error fetching element wisdom from book:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch element wisdom from book",
      });
    }
  },
);

/**
 * GET /elemental-alchemy/book/info
 * Returns general information about Kelly's integrated book
 */
elementalAlchemyRouter.get("/book/info", authenticate, async (req, res) => {
  try {
    const bookPath = path.join(
      __dirname,
      "../../data/founder-knowledge/elemental-alchemy-book.json",
    );
    const content = await fs.readFile(bookPath, "utf-8");
    const bookData = JSON.parse(content);

    const bookInfo = {
      title: bookData.title,
      author: bookData.author,
      publisher: "Soullab Media",
      processed_at: bookData.processed_at,
      chapters: bookData.content.chapters.map((ch: any) => ({
        number: ch.number,
        title: ch.title,
        element: ch.element,
      })),
      core_teachings_count: bookData.content.coreTeachings.length,
      book_length_chars: bookData.metadata.book_length,
      integration_status: "complete",
      available_elements: Object.keys(bookData.content.elementalWisdom),
      dedication: bookData.content.dedication?.substring(0, 200) + "...",
    };

    res.json({
      success: true,
      data: bookInfo,
    });
  } catch (error) {
    console.error("Error fetching book info:", error);
    res.status(404).json({
      success: false,
      error: "Book information not found",
    });
  }
});

/**
 * GET /elemental-alchemy/book/teachings/:limit?
 * Returns core teachings from Kelly's book
 */
elementalAlchemyRouter.get(
  "/book/teachings/:limit?",
  authenticate,
  async (req, res) => {
    try {
      const limit = parseInt(req.params.limit || "10");

      const bookPath = path.join(
        __dirname,
        "../../data/founder-knowledge/elemental-alchemy-book.json",
      );
      const content = await fs.readFile(bookPath, "utf-8");
      const bookData = JSON.parse(content);

      const teachings = bookData.content.coreTeachings
        .filter(
          (teaching: string) => teaching.length > 30 && teaching.length < 300,
        )
        .slice(0, limit);

      res.json({
        success: true,
        data: {
          source:
            "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life",
          author: "Kelly Nezat",
          teachings,
          total_available: bookData.content.coreTeachings.length,
          returned: teachings.length,
        },
      });
    } catch (error) {
      console.error("Error fetching teachings from book:", error);
      res.status(404).json({
        success: false,
        error: "Book teachings not found",
      });
    }
  },
);

// WebSocket endpoint for real-time updates
export function setupElementalAlchemyWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/elemental-alchemy",
  });

  wss.on("connection", (ws, req) => {
    const userId = req.url?.split("/").pop();

    if (!userId) {
      ws.close();
      return;
    }

    console.log(`Elemental Alchemy WebSocket connected for user ${userId}`);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "update-intensity":
            await elementalAlchemyService.updateHouseIntensity(
              userId,
              data.houseNumber,
              data.intensity,
            );
            break;

          case "activate-transformation":
            await elementalAlchemyService.activateTransformation(
              userId,
              data.fromHouse,
              data.toHouse,
            );
            break;

          case "integrate-phi-spiral":
            await elementalAlchemyService.integratePhiSpiral(userId);
            break;

          case "request-insights":
            await elementalAlchemyService.generatePersonalInsights(userId);
            break;

          case "request-group-alchemy":
            await elementalAlchemyService.analyzeGroupAlchemy(data.groupId);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process request",
          }),
        );
      }
    });

    ws.on("close", () => {
      console.log(`Elemental Alchemy WebSocket closed for user ${userId}`);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });
  });

  return wss;
}
