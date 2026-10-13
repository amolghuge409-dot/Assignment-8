import express from "express";
import mongoose from "mongoose";
import Student from "./models/Student.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.post("/api/students", async (request, response, next) => {
  try {
    const student = await Student.create(request.body);
    response.status(201).json({ data: student });
  } catch (error) {
    next(error);
  }
});

app.get("/api/students", async (request, response, next) => {
  try {
    const { department } = request.query;
    const filter = department ? { department: String(department) } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    response.json({ data: students, count: students.length });
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid student ID." });
    }
    const student = await Student.findById(request.params.id);
    if (!student) {
      return response.status(404).json({ error: "Student not found." });
    }
    response.json({ data: student });
  } catch (error) {
    next(error);
  }
});

app.put("/api/students/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid student ID." });
    }
    const student = await Student.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true },
    );
    if (!student) {
      return response.status(404).json({ error: "Student not found." });
    }
    response.json({ data: student });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid student ID." });
    }
    const student = await Student.findByIdAndDelete(request.params.id);
    if (!student) {
      return response.status(404).json({ error: "Student not found." });
    }
    response.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.use((error, _request, response, _next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return response.status(400).json({
      error: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message),
    });
  }
  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ error: "Invalid value for a student field." });
  }
  if (error?.code === 11000) {
    return response.status(409).json({ error: "A student with this roll number already exists." });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Request body must contain valid JSON." });
  }
  console.error("Unhandled API error:", error);
  return response.status(500).json({ error: "An unexpected server error occurred." });
});

export default app;
