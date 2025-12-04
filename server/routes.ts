import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertConnectionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid student data" });
    }
  });

  app.patch("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid update data" });
    }
  });

  app.get("/api/students/:id/matches", async (req, res) => {
    try {
      const currentStudent = await storage.getStudent(req.params.id);
      if (!currentStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      const allStudents = await storage.getAllStudents();
      const matches = allStudents
        .filter(s => s.id !== currentStudent.id)
        .map(student => {
          const sharedClasses = student.classes.filter(c => 
            currentStudent.classes.includes(c)
          );
          
          const sharedSlots = student.availableSlots.filter(slot => 
            currentStudent.availableSlots.includes(slot)
          );

          const classMatch = sharedClasses.length / Math.max(currentStudent.classes.length, 1);
          const scheduleMatch = sharedSlots.length / Math.max(currentStudent.availableSlots.length, 1);
          const matchPercentage = Math.round(((classMatch * 0.6) + (scheduleMatch * 0.4)) * 100);

          return {
            ...student,
            matchPercentage,
            sharedClasses,
            sharedSlots: sharedSlots.length,
          };
        })
        .filter(match => match.sharedClasses.length > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to find matches" });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const validatedData = insertConnectionSchema.parse(req.body);
      
      const existing = await storage.getConnection(
        validatedData.requesterId,
        validatedData.receiverId
      );
      
      if (existing) {
        return res.status(400).json({ error: "Connection already exists" });
      }

      const connection = await storage.createConnection(validatedData);
      res.status(201).json(connection);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid connection data" });
    }
  });

  app.get("/api/connections/:studentId", async (req, res) => {
    try {
      const connections = await storage.getConnectionsByStudent(req.params.studentId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.patch("/api/connections/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const connection = await storage.updateConnectionStatus(req.params.id, status);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update connection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
