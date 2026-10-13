import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import newman from "newman";
import request from "supertest";
import app from "../src/app.js";

describe("student API CRUD", () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await mongoose.connection.collection("students").createIndex(
      { rollNumber: 1 },
      { unique: true },
    );
  });

  beforeEach(async () => {
    await mongoose.connection.collection("students").deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("creates a student and lists students", async () => {
    const created = await request(app)
      .post("/api/students")
      .send({ name: "Aisha Sharma", rollNumber: "cs-101", department: "Computer Science", marks: 88 });

    assert.equal(created.status, 201);
    assert.equal(created.body.data.rollNumber, "CS-101");
    assert.equal(created.body.data.name, "Aisha Sharma");

    const list = await request(app).get("/api/students");
    assert.equal(list.status, 200);
    assert.equal(list.body.count, 1);
    assert.equal(list.body.data[0]._id, created.body.data._id);
  });

  it("reads one student and filters by department", async () => {
    const student = await mongoose.model("Student").create({
      name: "Ravi Patel",
      rollNumber: "ME-102",
      department: "Mechanical",
      marks: 76,
    });

    const detail = await request(app).get(`/api/students/${student.id}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.department, "Mechanical");

    const filtered = await request(app).get("/api/students?department=Mechanical");
    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.count, 1);
  });

  it("updates a student", async () => {
    const student = await mongoose.model("Student").create({
      name: "Neha Shah",
      rollNumber: "IT-103",
      department: "IT",
      marks: 65,
    });

    const updated = await request(app)
      .put(`/api/students/${student.id}`)
      .send({ marks: 92 });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.marks, 92);
    assert.equal(updated.body.data.name, "Neha Shah");
  });

  it("deletes a student", async () => {
    const student = await mongoose.model("Student").create({
      name: "Ishan Rao",
      rollNumber: "EC-104",
      department: "Electronics",
      marks: 81,
    });

    const deleted = await request(app).delete(`/api/students/${student.id}`);
    assert.equal(deleted.status, 200);
    assert.equal((await request(app).get(`/api/students/${student.id}`)).status, 404);
  });

  it("rejects invalid student data, duplicate roll numbers, and malformed IDs", async () => {
    const invalid = await request(app)
      .post("/api/students")
      .send({ name: "A", rollNumber: "CS-1", department: "CS", marks: 120 });
    assert.equal(invalid.status, 400);

    const data = { name: "Aman Joshi", rollNumber: "CS-2", department: "CS", marks: 82 };
    assert.equal((await request(app).post("/api/students").send(data)).status, 201);
    assert.equal((await request(app).post("/api/students").send(data)).status, 409);
    assert.equal((await request(app).get("/api/students/not-an-id")).status, 400);
  });

  it("passes the complete Postman collection against the API", async () => {
    const server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    const collectionPath = fileURLToPath(
      new URL("../postman/Assignment-8-Student-API.postman_collection.json", import.meta.url),
    );
    const collection = JSON.parse(await readFile(collectionPath, "utf8"));
    const baseUrl = `http://127.0.0.1:${address.port}`;
    collection.variable.find((variable) => variable.key === "baseUrl").value = baseUrl;

    try {
      const summary = await new Promise((resolve, reject) => {
        newman.run({ collection, reporters: "cli" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      assert.equal(summary.run.failures.length, 0);
      assert.equal(summary.run.stats.assertions.failed, 0);
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
