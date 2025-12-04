import { insertStudentSchema, insertConnectionSchema, type Student, type Connection } from "../shared/schema";

// In-memory storage
const students = new Map<string, Student>();
const connections = new Map<string, Connection>();

export const storage = {
  // Students
  async getAllStudents(): Promise<Student[]> {
    return Array.from(students.values());
  },

  async getStudent(id: string): Promise<Student | null> {
    return students.get(id) || null;
  },

  async createStudent(data: any): Promise<Student> {
    const student: Student = {
      id: crypto.randomUUID(),
      ...data,
    };
    students.set(student.id, student);
    return student;
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student | null> {
    const student = students.get(id);
    if (!student) return null;
    
    const updated: Student = { ...student, ...data };
    students.set(id, updated);
    return updated;
  },

  // Connections
  async getConnection(requesterId: string, receiverId: string): Promise<Connection | null> {
    return Array.from(connections.values()).find(
      (c) =>
        (c.requesterId === requesterId && c.receiverId === receiverId) ||
        (c.requesterId === receiverId && c.receiverId === requesterId)
    ) || null;
  },

  async createConnection(data: any): Promise<Connection> {
    const connection: Connection = {
      id: crypto.randomUUID(),
      ...data,
      status: "pending",
    };
    connections.set(connection.id, connection);
    return connection;
  },

  async getConnectionsByStudent(studentId: string): Promise<Connection[]> {
    return Array.from(connections.values()).filter(
      (c) => c.requesterId === studentId || c.receiverId === studentId
    );
  },

  async updateConnectionStatus(id: string, status: string): Promise<Connection | null> {
    const connection = connections.get(id);
    if (!connection) return null;
    
    const updated: Connection = { ...connection, status };
    connections.set(id, updated);
    return updated;
  },
};