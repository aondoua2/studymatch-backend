import { type Student, type InsertStudent, type Connection, type InsertConnection } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionsByStudent(studentId: string): Promise<Connection[]>;
  updateConnectionStatus(id: string, status: string): Promise<Connection | undefined>;
  getConnection(requesterId: string, receiverId: string): Promise<Connection | undefined>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private connections: Map<string, Connection>;

  constructor() {
    this.students = new Map();
    this.connections = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleStudents: InsertStudent[] = [
      {
        name: "Sarah Johnson",
        email: "sarah.j@university.edu",
        major: "Computer Science",
        year: "Junior",
        classes: ["CS 301", "MATH 240", "PHYS 211"],
        availableSlots: ["Mon-10", "Mon-14", "Tue-10", "Wed-10", "Wed-14", "Thu-14", "Fri-10", "Fri-14"],
      },
      {
        name: "Michael Chen",
        email: "mchen@university.edu",
        major: "Biology",
        year: "Sophomore",
        classes: ["BIO 201", "CHEM 102", "MATH 240"],
        availableSlots: ["Mon-10", "Mon-11", "Tue-14", "Wed-10", "Thu-14"],
      },
      {
        name: "Emma Davis",
        email: "emma.d@university.edu",
        major: "Mathematics",
        year: "Senior",
        classes: ["MATH 240", "CS 301", "STAT 410"],
        availableSlots: ["Mon-14", "Tue-10", "Tue-14", "Wed-14", "Thu-10", "Fri-14"],
      },
      {
        name: "James Wilson",
        email: "jwilson@university.edu",
        major: "Physics",
        year: "Junior",
        classes: ["PHYS 211", "MATH 240", "CS 201"],
        availableSlots: ["Mon-10", "Tue-10", "Wed-10", "Thu-14", "Fri-10"],
      },
      {
        name: "Olivia Martinez",
        email: "olivia.m@university.edu",
        major: "Chemistry",
        year: "Sophomore",
        classes: ["CHEM 102", "BIO 201", "MATH 140"],
        availableSlots: ["Mon-11", "Tue-14", "Wed-11", "Thu-11", "Fri-14"],
      },
    ];

    sampleStudents.forEach(student => {
      const id = randomUUID();
      this.students.set(id, { ...student, id });
    });
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      classes: insertStudent.classes || [],
      availableSlots: insertStudent.availableSlots || []
    };
    this.students.set(id, student);
    return student;
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updated: Student = { 
      ...student, 
      ...updates,
      classes: updates.classes !== undefined ? updates.classes : student.classes,
      availableSlots: updates.availableSlots !== undefined ? updates.availableSlots : student.availableSlots
    };
    this.students.set(id, updated);
    return updated;
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = randomUUID();
    const connection: Connection = { ...insertConnection, id, status: "pending" };
    this.connections.set(id, connection);
    return connection;
  }

  async getConnectionsByStudent(studentId: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.requesterId === studentId || conn.receiverId === studentId
    );
  }

  async updateConnectionStatus(id: string, status: string): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;

    const updated = { ...connection, status };
    this.connections.set(id, updated);
    return updated;
  }

  async getConnection(requesterId: string, receiverId: string): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(
      (conn) => 
        (conn.requesterId === requesterId && conn.receiverId === receiverId) ||
        (conn.requesterId === receiverId && conn.receiverId === requesterId)
    );
  }
}

export const storage = new MemStorage();
