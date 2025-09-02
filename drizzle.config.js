import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: {
    url:'postgresql://neondb_owner:npg_vTUiW71QNczu@ep-cool-salad-a8jw5jul-pooler.eastus2.azure.neon.tech/ai-interview-mocker?sslmode=require'
  }
})