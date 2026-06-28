import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Portfolio from "./models/Portfolio.js";
import User from "./models/User.js";
import { cloneSiteContent, sampleSiteContent } from "./data/sampleSite.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio_builder";
const authSecret = process.env.AUTH_SECRET || "dev-secret-change-me";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derivedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(derivedHash, "hex"));
}

function createToken(payload) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(body));
  } catch (_error) {
    return null;
  }
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    onboardingComplete: user.onboardingComplete,
  };
}

function extractBearerToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }

  return header.slice("Bearer ".length);
}

async function requireAuth(request, response, next) {
  const token = extractBearerToken(request);
  const payload = verifyToken(token);

  if (!payload?.userId) {
    return response.status(401).json({ message: "Authentication required" });
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    return response.status(401).json({ message: "User not found" });
  }

  request.user = user;
  return next();
}

async function ensurePublicPortfolio() {
  const existing = await Portfolio.findOne({ slug: "public-site" });
  if (existing) {
    return existing;
  }

  return Portfolio.create({
    slug: "public-site",
    title: "Sher Singh Public Portfolio",
    theme: "dark",
    content: cloneSiteContent(),
  });
}

async function ensureUserWorkspace(user) {
  const slug = `user-${user._id}`;
  const existing = await Portfolio.findOne({ slug });
  if (existing) {
    return existing;
  }

  return Portfolio.create({
    slug,
    userId: user._id,
    title: `${user.name} Workspace`,
    theme: "dark",
    content: {
      profile: {
        ...cloneSiteContent().profile,
        name: user.name,
        email: user.email,
      },
      notes: {
        onboardingStatus: "started",
      },
    },
  });
}

function generateAssistantReply(question, content) {
  const normalized = question.toLowerCase();
  const profile = content.profile;

  if (normalized.includes("docker") || normalized.includes("container")) {
    return `${profile.name} uses Docker and Docker Compose for local orchestration, app packaging, and environment troubleshooting. The portfolio itself is Docker-ready and highlights container health, reverse proxying, and observability workflows.`;
  }

  if (normalized.includes("linux") || normalized.includes("ubuntu")) {
    return `${profile.name} works primarily in Linux environments, especially Ubuntu, with experience in shell commands, service debugging, permissions, and system-level troubleshooting.`;
  }

  if (normalized.includes("monitor") || normalized.includes("grafana") || normalized.includes("prometheus") || normalized.includes("loki")) {
    return `${profile.name} has a strong monitoring focus with Prometheus, Grafana, Loki, and Netdata. His projects emphasize metrics visibility, logs, health checks, and operational clarity.`;
  }

  if (normalized.includes("resume") || normalized.includes("experience")) {
    return `${profile.name} is a Jr. DevOps Engineer with hands-on exposure to Docker, Linux, monitoring stacks, automation, networking basics, MongoDB, Node.js, React, and Mirasys VMS support experience.`;
  }

  if (normalized.includes("project")) {
    const featured = content.projects
      .slice(0, 2)
      .map((project) => project.name)
      .join(" and ");
    return `Featured projects include ${featured}. Each case study emphasizes architecture, debugging decisions, and measurable outcomes rather than just a tool list.`;
  }

  return `${profile.name} focuses on practical DevOps work: Linux administration, Dockerized workflows, monitoring stacks, automation, infrastructure troubleshooting, and full-stack support tooling.`;
}

function calculateJobMatch(description, content) {
  const normalized = description.toLowerCase();
  const catalog = content.skills.flatMap((group) => group.items);
  const matchedSkills = catalog.filter((skill) => normalized.includes(skill.toLowerCase()));
  const uniqueMatches = [...new Set(matchedSkills)];
  const percentage = Math.max(18, Math.min(97, Math.round((uniqueMatches.length / catalog.length) * 100 * 3.5)));
  const missingSkills = content.skills
    .filter((group) => !group.items.some((item) => normalized.includes(item.toLowerCase())))
    .slice(0, 4)
    .map((group) => group.category);
  const suggestedProjects = content.projects
    .filter((project) =>
      project.tech.some((tech) => normalized.includes(tech.toLowerCase())) || normalized.includes(project.category.toLowerCase())
    )
    .slice(0, 3)
    .map((project) => project.name);

  return {
    matchPercentage: percentage,
    matchedSkills: uniqueMatches,
    missingSkills,
    suggestedProjects: suggestedProjects.length ? suggestedProjects : content.projects.slice(0, 2).map((project) => project.name),
    coverLetter:
      "Cover letter placeholder: Sher Singh brings practical Linux, Docker, monitoring, automation, and debugging experience that aligns well with this role. Replace this placeholder with role-specific language before applying.",
    interviewQuestions: [
      "How would you troubleshoot a containerized service that is failing health checks?",
      "How do Prometheus, Grafana, and Loki complement each other?",
      "What operational tasks would you automate first in this role?",
    ],
  };
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    service: "portfolio-builder-api",
  });
});

app.get("/api/site-content", async (_request, response) => {
  try {
    const site = await ensurePublicPortfolio();
    return response.json(site.content);
  } catch (error) {
    return response.status(500).json({ message: "Failed to load site content" });
  }
});

app.get("/api/portfolio", async (_request, response) => {
  try {
    const site = await ensurePublicPortfolio();
    return response.json(site.content);
  } catch (error) {
    return response.status(500).json({ message: "Failed to load portfolio" });
  }
});

app.post("/api/portfolio", async (request, response) => {
  try {
    const site = await Portfolio.findOneAndUpdate(
      { slug: "public-site" },
      {
        slug: "public-site",
        title: "Sher Singh Public Portfolio",
        theme: request.body.theme || "dark",
        content: request.body,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return response.status(201).json(site.content);
  } catch (error) {
    return response.status(500).json({ message: "Failed to save portfolio" });
  }
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password || password.length < 8) {
      return response.status(400).json({ message: "Name, email, and a password with at least 8 characters are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return response.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: createPasswordHash(password),
      provider: "local",
      onboardingComplete: false,
    });

    await ensureUserWorkspace(user);

    const token = createToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    });

    return response.status(201).json({
      message: "Account created. Welcome email integration placeholder triggered.",
      welcomeEmailStatus: "placeholder_sent",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return response.status(500).json({ message: "Failed to register user" });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (!user || !verifyPassword(password || "", user.passwordHash)) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await ensureUserWorkspace(user);

    const token = createToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    });

    return response.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return response.status(500).json({ message: "Failed to log in" });
  }
});

app.get("/api/auth/me", requireAuth, async (request, response) => {
  return response.json({ user: sanitizeUser(request.user) });
});

app.get("/api/user/portfolio", requireAuth, async (request, response) => {
  try {
    const workspace = await ensureUserWorkspace(request.user);
    return response.json(workspace.content);
  } catch (error) {
    return response.status(500).json({ message: "Failed to load user workspace" });
  }
});

app.put("/api/user/portfolio", requireAuth, async (request, response) => {
  try {
    const workspace = await Portfolio.findOneAndUpdate(
      { slug: `user-${request.user._id}` },
      {
        slug: `user-${request.user._id}`,
        userId: request.user._id,
        title: `${request.user.name} Workspace`,
        theme: request.body.theme || "dark",
        content: request.body,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    request.user.onboardingComplete = true;
    await request.user.save();

    return response.json(workspace.content);
  } catch (error) {
    return response.status(500).json({ message: "Failed to save user workspace" });
  }
});

app.get("/api/projects", async (_request, response) => {
  return response.json(cloneSiteContent().projects);
});

app.get("/api/blogs", async (_request, response) => {
  return response.json(cloneSiteContent().blogPosts);
});

app.get("/api/skills", async (_request, response) => {
  return response.json(cloneSiteContent().skills);
});

app.get("/api/resume", async (_request, response) => {
  const content = cloneSiteContent();
  return response.json({
    profile: content.profile,
    experience: content.experience,
    education: content.education,
    achievements: content.achievements,
    certifications: content.certifications,
  });
});

app.get("/api/github/analytics", async (_request, response) => {
  return response.json(cloneSiteContent().github);
});

app.get("/api/dashboard/metrics", async (_request, response) => {
  return response.json(cloneSiteContent().devopsDashboard);
});

app.post("/api/contact", async (request, response) => {
  const { name, email, message } = request.body;

  if (!name || !email || !message) {
    return response.status(400).json({ message: "Name, email, and message are required" });
  }

  return response.status(201).json({
    status: "queued",
    message: "Message received. Email delivery integration placeholder can be connected here.",
  });
});

app.post("/api/ai/assistant", async (request, response) => {
  const question = request.body.question || "";
  const content = cloneSiteContent();

  return response.json({
    answer: generateAssistantReply(question, content),
    suggestions: content.suggestedQuestions,
  });
});

app.post("/api/ai/job-match", async (request, response) => {
  const description = request.body.description || "";

  if (!description.trim()) {
    return response.status(400).json({ message: "Job description is required" });
  }

  return response.json(calculateJobMatch(description, cloneSiteContent()));
});

app.get("/api/admin/overview", async (_request, response) => {
  const content = cloneSiteContent();
  return response.json({
    collections: content.adminCollections,
    stats: {
      projects: content.projects.length,
      blogPosts: content.blogPosts.length,
      skills: content.skills.length,
      certifications: content.certifications.length,
      testimonials: content.testimonials.length,
    },
    authMode: "placeholder",
  });
});

app.post("/api/admin/:collection", async (request, response) => {
  return response.status(201).json({
    status: "placeholder_created",
    collection: request.params.collection,
    payload: request.body,
  });
});

app.put("/api/admin/:collection/:id", async (request, response) => {
  return response.json({
    status: "placeholder_updated",
    collection: request.params.collection,
    id: request.params.id,
    payload: request.body,
  });
});

app.delete("/api/admin/:collection/:id", async (request, response) => {
  return response.json({
    status: "placeholder_deleted",
    collection: request.params.collection,
    id: request.params.id,
  });
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    await ensurePublicPortfolio();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
}

startServer();
