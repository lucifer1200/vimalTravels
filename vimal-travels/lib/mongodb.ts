// lib/mongodb.ts — kept for compatibility but MongoDB is not used
export default async function connectDB() {
  throw new Error("MongoDB is not configured.");
}
