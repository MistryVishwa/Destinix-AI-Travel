import { Router } from "express";
import { prisma } from "../collaboration/services/db";

const router = Router();

// GET all public journals (Community Feed)
router.get("/", async (req, res) => {
  try {
    const journals = await prisma.tripJournal.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(journals);
  } catch (err: any) {
    console.error("Error fetching journals:", err);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
});

// GET journals by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const journals = await prisma.tripJournal.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(journals);
  } catch (err: any) {
    console.error("Error fetching user journals:", err);
    res.status(500).json({ error: "Failed to fetch user journals" });
  }
});

// GET a specific journal by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const journal = await prisma.tripJournal.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
    });

    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    res.json(journal);
  } catch (err: any) {
    console.error("Error fetching journal:", err);
    res.status(500).json({ error: "Failed to fetch journal" });
  }
});

// POST a new journal
router.post("/", async (req, res) => {
  try {
    const { userId, title, content, coverImage, isPublic } = req.body;
    
    if (!userId || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newJournal = await prisma.tripJournal.create({
      data: {
        userId,
        title,
        content,
        coverImage,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        }
      }
    });

    res.status(201).json(newJournal);
  } catch (err: any) {
    console.error("Error creating journal:", err);
    res.status(500).json({ error: "Failed to create journal" });
  }
});

// PUT update a journal
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, coverImage, isPublic, userId } = req.body;

    const existingJournal = await prisma.tripJournal.findUnique({ where: { id } });
    if (!existingJournal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    if (existingJournal.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedJournal = await prisma.tripJournal.update({
      where: { id },
      data: { title, content, coverImage, isPublic },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        }
      }
    });

    res.json(updatedJournal);
  } catch (err: any) {
    console.error("Error updating journal:", err);
    res.status(500).json({ error: "Failed to update journal" });
  }
});

// DELETE a journal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Expecting userId to verify ownership

    const existingJournal = await prisma.tripJournal.findUnique({ where: { id } });
    if (!existingJournal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    if (existingJournal.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.tripJournal.delete({ where: { id } });
    res.json({ success: true, message: "Journal deleted" });
  } catch (err: any) {
    console.error("Error deleting journal:", err);
    res.status(500).json({ error: "Failed to delete journal" });
  }
});

export default router;
