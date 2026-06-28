import anime from "animejs/lib/anime.es.js";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import { fallbackContent } from "./data/fallbackContent";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const flowSteps = [
  { id: "auth", label: "Login" },
  { id: "information", label: "Information" },
  { id: "review", label: "Visualize" },
  { id: "preview", label: "Preview" },
];

const landingHighlights = [
  "Anime.js page transitions",
  "Guided portfolio data capture",
  "Visual confirmation before preview",
  "PDF CV download from your data",
];

function App() {
  const screenShellRef = useRef(null);
  const transitionLayerRef = useRef(null);
  const hasAnimatedInitialScreen = useRef(false);
  const isTransitioning = useRef(false);
  const [siteContent, setSiteContent] = useState(fallbackContent);
  const [theme, setTheme] = useState("dark");
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("signin");
  const [status, setStatus] = useState("Loading portfolio builder...");
  const [health, setHealth] = useState({ api: "Checking API...", database: "Checking database..." });
  const [toast, setToast] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", code: "" });
  const [authState, setAuthState] = useState(() => {
    const storedUser = window.localStorage.getItem("portfolio-user");
    const storedToken = window.localStorage.getItem("portfolio-token");
    return {
      token: storedToken || "",
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  });
  const [workspace, setWorkspace] = useState(null);
  const [builderData, setBuilderData] = useState(() => createBuilderState(fallbackContent));
  const [builderTab, setBuilderTab] = useState("identity");
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => {
    return builderData.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [builderData.name]);

  const filteredProjects = useMemo(() => {
    if (builderData.projectFilter === "All") {
      return builderData.projects;
    }

    return builderData.projects.filter((project) => project.category === builderData.projectFilter);
  }, [builderData.projectFilter, builderData.projects]);

  const projectCategories = useMemo(() => {
    return [...new Set(builderData.projects.map((project) => project.category || "Project"))];
  }, [builderData.projects]);

  const dataStats = useMemo(() => {
    const contactFields = [builderData.email, builderData.phone, builderData.website].filter(Boolean).length;
    const profileFields = [
      builderData.name,
      builderData.title,
      builderData.subtitle,
      builderData.about,
      builderData.location,
      builderData.status,
      builderData.email,
      builderData.phone,
      builderData.website,
    ];
    const completed = profileFields.filter((value) => String(value || "").trim()).length;
    const completion = Math.round((completed / profileFields.length) * 100);
    return {
      completion,
      skills: builderData.skills.length,
      projects: builderData.projects.length,
      categories: projectCategories.length,
      contactCompletion: Math.round((contactFields / 3) * 100),
    };
  }, [builderData, projectCategories.length]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.title = `${siteContent.profile.name} | ${siteContent.profile.title}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", siteContent.seo.description);
    }
  }, [siteContent]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(refreshHealth, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (authState.token && !authState.token.startsWith("local-demo-")) {
      loadWorkspace(authState.token);
    }
  }, [authState.token]);

  useEffect(() => {
    const activeScreen = screenShellRef.current?.querySelector(".screen-card");
    if (!activeScreen) {
      return;
    }

    const animatedItems = activeScreen.querySelectorAll("[data-animate]");

    anime.remove([activeScreen, ...animatedItems]);
    anime.set(activeScreen, { opacity: 0, scale: 0.98, translateY: 24 });
    anime.set(animatedItems, { opacity: 0, translateY: 18 });

    if (!hasAnimatedInitialScreen.current) {
      hasAnimatedInitialScreen.current = true;
      anime({
        targets: [activeScreen, ...animatedItems],
        opacity: 1,
        scale: 1,
        translateY: 0,
        duration: 720,
        delay: anime.stagger(55),
        easing: "easeOutExpo",
      });
      return;
    }

    const transitionLayer = transitionLayerRef.current;
    anime
      .timeline({
        complete: () => {
          anime.set(transitionLayer, { translateY: "100%" });
          isTransitioning.current = false;
        },
      })
      .add({
        targets: transitionLayer,
        translateY: ["0%", "-100%"],
        duration: 660,
        easing: "easeInOutCubic",
      })
      .add(
        {
          targets: activeScreen,
          opacity: [0, 1],
          scale: [0.98, 1],
          translateY: [24, 0],
          duration: 760,
          easing: "easeOutExpo",
        },
        120
      )
      .add(
        {
          targets: animatedItems,
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 620,
          delay: anime.stagger(48),
          easing: "easeOutExpo",
        },
        220
      );
  }, [screen]);

  function changeScreen(nextScreen, nextStatus) {
    if (nextScreen === screen) {
      if (nextStatus) {
        setStatus(nextStatus);
      }
      return;
    }

    if (isTransitioning.current) {
      return;
    }

    const activeScreen = screenShellRef.current?.querySelector(".screen-card");
    const transitionLayer = transitionLayerRef.current;

    if (!activeScreen || !transitionLayer) {
      setScreen(nextScreen);
      if (nextStatus) {
        setStatus(nextStatus);
      }
      return;
    }

    isTransitioning.current = true;
    anime.remove([activeScreen, transitionLayer]);
    anime.set(transitionLayer, { translateY: "100%" });

    anime
      .timeline({
        complete: () => {
          setScreen(nextScreen);
          if (nextStatus) {
            setStatus(nextStatus);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      })
      .add({
        targets: activeScreen,
        opacity: [1, 0],
        scale: [1, 0.97],
        translateY: [0, -18],
        duration: 360,
        easing: "easeInCubic",
      })
      .add(
        {
          targets: transitionLayer,
          translateY: ["100%", "0%"],
          duration: 560,
          easing: "easeInOutCubic",
        },
        30
      );
  }

  async function loadInitialData() {
    try {
      const [healthResponse, siteResponse] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/site-content`),
      ]);

      const healthData = await healthResponse.json();
      const siteData = siteResponse.ok ? await siteResponse.json() : fallbackContent;
      setSiteContent({ ...fallbackContent, ...siteData });
      setBuilderData(createBuilderState({ ...fallbackContent, ...siteData }));
      setTheme(siteData.theme || "dark");
      setHealth({
        api: healthData.ok ? "API online" : "API issue detected",
        database: healthData.database === "connected" ? "Database connected" : "Database disconnected",
      });
      setStatus("Ready. Start with login, then build and download the CV.");
    } catch (_error) {
      setSiteContent(fallbackContent);
      setBuilderData(createBuilderState(fallbackContent));
      setHealth({ api: "Demo mode", database: "Local data" });
      setStatus("Demo mode loaded. You can complete the full frontend flow.");
    }
  }

  async function refreshHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      setHealth({
        api: data.ok ? "API online" : "API issue detected",
        database: data.database === "connected" ? "Database connected" : "Database disconnected",
      });
    } catch (_error) {
      setHealth({ api: "Demo mode", database: "Local data" });
    }
  }

  function updateBuilderField(field, value) {
    setBuilderData((current) => ({ ...current, [field]: value }));
  }

  function updateBuilderArray(field, value) {
    setBuilderData((current) => ({
      ...current,
      [field]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  }

  function updateProject(id, field, value) {
    setBuilderData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    }));
  }

  function updateProjectList(id, field, value) {
    updateProject(
      id,
      field,
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  function addProject() {
    setBuilderData((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: crypto.randomUUID(),
          name: "New Project",
          category: "Custom",
          summary: "Write a short summary for this project.",
          tech: ["Docker", "Node.js"],
          githubUrl: "https://github.com/",
          demoUrl: "https://example.com",
          coverImage: "",
          metrics: ["Add one measurable result"],
          architecture: "Explain the architecture clearly.",
          challenges: "Describe the main challenge.",
          solutions: "Describe the chosen solution.",
          screenshots: ["Screenshot Placeholder"],
          caseStudy: "Add a short case study description.",
        },
      ],
    }));
  }

  function removeProject(id) {
    setBuilderData((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
    }));
  }

  function handleImageSelect(event, field) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateBuilderField(field, reader.result);
    reader.readAsDataURL(file);
  }

  function handleProjectImageSelect(event, projectId) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateProject(projectId, "coverImage", reader.result);
    reader.readAsDataURL(file);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    const endpoint =
      authMode === "signup"
        ? "/api/auth/register"
        : authMode === "verify"
          ? "/api/auth/verify-email"
          : "/api/auth/login";
    const payload =
      authMode === "signup"
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : authMode === "verify"
          ? { email: authForm.email, code: authForm.code }
          : { email: authForm.email, password: authForm.password };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.verificationRequired) {
          setAuthMode("verify");
          setToast(data.message || "Verify your email before continuing.");
          return;
        }

        throw new Error(data.message || "Authentication failed");
      }

      if (data.verificationRequired) {
        setAuthMode("verify");
        setAuthForm((current) => ({ ...current, email: data.email || current.email, code: data.devVerificationCode || "" }));
        setToast(data.devVerificationCode ? `Dev verification code: ${data.devVerificationCode}` : data.message);
        setStatus("Check your email for the verification code.");
        return;
      }

      completeAuthentication(data.token, data.user, authMode === "verify" ? "Email verified." : "Signed in.");
    } catch (error) {
      setToast(error.message || "Authentication service is unavailable");
      setStatus("Authentication failed. Check your details and try again.");
    }
  }

  async function resendVerificationCode() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not resend code");
      }

      setAuthForm((current) => ({ ...current, code: data.devVerificationCode || current.code }));
      setToast(data.devVerificationCode ? `Dev verification code: ${data.devVerificationCode}` : data.message);
    } catch (error) {
      setToast(error.message || "Could not resend code");
    }
  }

  function completeAuthentication(token, user, message) {
    setAuthState({ token, user });
    window.localStorage.setItem("portfolio-token", token);
    window.localStorage.setItem("portfolio-user", JSON.stringify(user));
    setAuthForm({ name: "", email: "", password: "", code: "" });
    setToast(message);
    changeScreen("information", "Information gathering active.");
  }

  async function loadWorkspace(token = authState.token) {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load workspace");
      }

      setWorkspace(data);
      const merged = mergeWorkspaceIntoBuilder(siteContent, data);
      setBuilderData(merged);
      setTheme(merged.theme || "dark");
    } catch (_error) {
      setWorkspace(null);
    }
  }

  async function saveWorkspace() {
    if (!authState.token) {
      setToast("Sign in first to save customization.");
      return;
    }

    if (authState.token.startsWith("local-demo-")) {
      window.localStorage.setItem("portfolio-builder-data", JSON.stringify(createWorkspacePayload(builderData)));
      setToast("Saved locally for this browser.");
      setStatus("Local data saved. Review is ready.");
      return;
    }

    setSaving(true);

    try {
      const payload = createWorkspacePayload(builderData);
      const response = await fetch(`${API_BASE}/api/user/portfolio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save workspace");
      }

      setWorkspace(data);
      setToast("Customization saved.");
      setStatus("Customization saved. Review is ready.");
    } catch (saveError) {
      setToast(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function openReview() {
    await saveWorkspace();
    changeScreen("review", "Data visualization and confirmation active.");
  }

  function openPreview() {
    changeScreen("preview", "Preview and PDF download active.");
  }

  function logout() {
    window.localStorage.removeItem("portfolio-token");
    window.localStorage.removeItem("portfolio-user");
    setAuthState({ token: "", user: null });
    setWorkspace(null);
    changeScreen("landing", "Signed out. Start again when ready.");
    setToast("Signed out.");
  }

  function downloadCvPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 44;
    let y = 54;

    const writeLine = (text, size = 10, weight = "normal", color = [36, 42, 56]) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(String(text || ""), margin, y);
      y += size + 8;
    };

    const writeWrapped = (text, size = 10) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(56, 64, 80);
      const lines = doc.splitTextToSize(String(text || ""), pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * (size + 4) + 12;
    };

    doc.setFillColor(255, 141, 92);
    doc.rect(0, 0, pageWidth, 12, "F");
    writeLine(builderData.name, 24, "bold", [15, 25, 38]);
    writeLine(builderData.title, 13, "bold", [31, 139, 119]);
    writeLine(`${builderData.email} | ${builderData.phone} | ${builderData.website}`, 9);
    writeLine(`${builderData.location} | ${builderData.status}`, 9);
    y += 10;

    writeLine("PROFILE", 11, "bold", [214, 92, 45]);
    writeWrapped(builderData.about, 10);

    writeLine("SKILLS", 11, "bold", [214, 92, 45]);
    writeWrapped(builderData.skills.join(" | "), 10);

    writeLine("PROJECTS", 11, "bold", [214, 92, 45]);
    builderData.projects.slice(0, 5).forEach((project) => {
      if (y > 720) {
        doc.addPage();
        y = 54;
      }
      writeLine(project.name, 12, "bold", [15, 25, 38]);
      writeLine(`${project.category} | ${project.tech.join(", ")}`, 9, "normal", [31, 139, 119]);
      writeWrapped(project.summary, 9);
    });

    doc.save(`${builderData.name.replace(/\s+/g, "-").toLowerCase()}-cv.pdf`);
    setToast("CV PDF downloaded.");
  }

  function renderFlowTracker() {
    const activeIndex = flowSteps.findIndex((step) => step.id === screen);
    return (
      <div className="flow-tracker" data-animate>
        {flowSteps.map((step, index) => (
          <button
            className={`flow-step ${index <= activeIndex ? "active" : ""}`}
            disabled={index > activeIndex + 1 && !authState.user}
            key={step.id}
            type="button"
            onClick={() => changeScreen(step.id)}
          >
            <span>{index + 1}</span>
            {step.label}
          </button>
        ))}
      </div>
    );
  }

  function renderLanding() {
    return (
      <section className="screen-card landing-screen">
        <div className="hero-layer hero-layer-one"></div>
        <div className="hero-layer hero-layer-two"></div>
        <div className="landing-content" data-animate>
          <p className="eyebrow">Creative Portfolio Builder</p>
          <h1>{siteContent.profile.name}</h1>
          <h2>{siteContent.profile.title}</h2>
          <p className="landing-copy">
            Build a portfolio through a guided flow with animated page movement, data confirmation,
            a polished preview, and a downloadable CV PDF.
          </p>
          <div className="highlight-grid">
            {landingHighlights.map((item) => (
              <div className="highlight-pill" key={item} data-animate>
                {item}
              </div>
            ))}
          </div>
          <div className="landing-actions" data-animate>
            <button className="button primary large-button" type="button" onClick={() => changeScreen("auth", "Login or signup active.")}>
              Start Builder
            </button>
            <button className="button" type="button" onClick={() => changeScreen("preview", "Preview and PDF download active.")}>
              View Preview
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderAuth() {
    return (
      <section className="screen-card auth-screen journey-screen">
        <div className="journey-side" data-animate>
          {renderFlowTracker()}
          <p className="eyebrow">Step 1</p>
          <h2>Login or create your builder session.</h2>
          <p>
            This step opens the portfolio workspace. If your backend is offline, the frontend continues in demo mode so the full experience remains clickable.
          </p>
          <div className="mini-status">
            <span>{health.api}</span>
            <span>{health.database}</span>
          </div>
        </div>

        <div className="auth-card" data-animate>
          <div className="tab-row">
            <button className={`tab-chip ${authMode === "signin" ? "active" : ""}`} type="button" onClick={() => setAuthMode("signin")}>
              Sign In
            </button>
            <button className={`tab-chip ${authMode === "signup" ? "active" : ""}`} type="button" onClick={() => setAuthMode("signup")}>
              Sign Up
            </button>
            <button className={`tab-chip ${authMode === "verify" ? "active" : ""}`} type="button" onClick={() => setAuthMode("verify")}>
              Verify
            </button>
          </div>

          <form className="stack-form" onSubmit={handleAuthSubmit}>
            {authMode === "signup" ? (
              <label>
                Full name
                <input value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} placeholder="Sher Singh" />
              </label>
            ) : null}
            <label>
              Email
              <input type="email" required value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
            </label>
            {authMode === "verify" ? (
              <label>
                Verification code
                <input inputMode="numeric" pattern="[0-9]{6}" required value={authForm.code} onChange={(event) => setAuthForm((current) => ({ ...current, code: event.target.value }))} placeholder="6-digit code" />
              </label>
            ) : (
              <label>
                Password
                <input type="password" required value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="Minimum 8 characters" />
              </label>
            )}
            <button className="button primary large-button" type="submit">
              {authMode === "verify" ? "Verify Email" : "Continue to Information"}
            </button>
            {authMode === "verify" ? (
              <button className="button ghost-button" type="button" onClick={resendVerificationCode}>
                Resend Code
              </button>
            ) : null}
          </form>

          <button className="button ghost-button" type="button" onClick={() => changeScreen("landing")}>
            Back to Front Page
          </button>
        </div>
      </section>
    );
  }

  function renderInformation() {
    return (
      <section className="screen-card workspace-screen journey-screen">
        <div className="workspace-topbar" data-animate>
          <div>
            {renderFlowTracker()}
            <p className="eyebrow">Step 2</p>
            <h2>Information gathering workspace.</h2>
          </div>
          <div className="button-row">
            <button className="button" type="button" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="button" type="button" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="workspace-actions" data-animate>
          <button className={`tab-chip ${builderTab === "identity" ? "active" : ""}`} type="button" onClick={() => setBuilderTab("identity")}>Identity</button>
          <button className={`tab-chip ${builderTab === "projects" ? "active" : ""}`} type="button" onClick={() => setBuilderTab("projects")}>Projects</button>
          <button className={`tab-chip ${builderTab === "contact" ? "active" : ""}`} type="button" onClick={() => setBuilderTab("contact")}>Contact</button>
        </div>

        <div className="workspace-grid">
          <div className="editor-panel">
            {builderTab === "identity" ? (
              <div className="editor-card slide-up" data-animate>
                <h3>Portfolio Identity</h3>
                <label>Name<input value={builderData.name} onChange={(event) => updateBuilderField("name", event.target.value)} /></label>
                <label>Role<input value={builderData.title} onChange={(event) => updateBuilderField("title", event.target.value)} /></label>
                <label>Subtitle<input value={builderData.subtitle} onChange={(event) => updateBuilderField("subtitle", event.target.value)} /></label>
                <label>About<textarea rows="5" value={builderData.about} onChange={(event) => updateBuilderField("about", event.target.value)} /></label>
                <label>Location<input value={builderData.location} onChange={(event) => updateBuilderField("location", event.target.value)} /></label>
                <label>Status<input value={builderData.status} onChange={(event) => updateBuilderField("status", event.target.value)} /></label>
                <label>Skills<textarea rows="3" value={builderData.skills.join(", ")} onChange={(event) => updateBuilderArray("skills", event.target.value)} /></label>
                <label>Profile image<input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, "photo")} /></label>
              </div>
            ) : null}

            {builderTab === "projects" ? (
              <div className="editor-card slide-up" data-animate>
                <div className="editor-heading">
                  <h3>Projects</h3>
                  <button className="button primary" type="button" onClick={addProject}>Add Project</button>
                </div>
                {builderData.projects.map((project) => (
                  <div className="project-editor" key={project.id}>
                    <input value={project.name} onChange={(event) => updateProject(project.id, "name", event.target.value)} placeholder="Project name" />
                    <input value={project.category} onChange={(event) => updateProject(project.id, "category", event.target.value)} placeholder="Category" />
                    <input value={project.demoUrl || ""} onChange={(event) => updateProject(project.id, "demoUrl", event.target.value)} placeholder="Live demo URL" />
                    <input value={project.githubUrl || ""} onChange={(event) => updateProject(project.id, "githubUrl", event.target.value)} placeholder="GitHub repo URL" />
                    <textarea rows="3" value={project.summary} onChange={(event) => updateProject(project.id, "summary", event.target.value)} />
                    <textarea rows="3" value={project.tech.join(", ")} onChange={(event) => updateProjectList(project.id, "tech", event.target.value)} />
                    <label>Manual project cover<input type="file" accept="image/*" onChange={(event) => handleProjectImageSelect(event, project.id)} /></label>
                    <button className="button danger" type="button" onClick={() => removeProject(project.id)}>Remove</button>
                  </div>
                ))}
              </div>
            ) : null}

            {builderTab === "contact" ? (
              <div className="editor-card slide-up" data-animate>
                <h3>Contact Details</h3>
                <label>Email<input value={builderData.email} onChange={(event) => updateBuilderField("email", event.target.value)} /></label>
                <label>Phone<input value={builderData.phone} onChange={(event) => updateBuilderField("phone", event.target.value)} /></label>
                <label>Website<input value={builderData.website} onChange={(event) => updateBuilderField("website", event.target.value)} /></label>
              </div>
            ) : null}
          </div>

          <div className="preview-side">
            <div className="mini-preview-card" data-animate>
              <p className="eyebrow">Live Snapshot</p>
              <div className="mini-preview-hero">
                <div className="avatar-frame">{builderData.photo ? <img src={builderData.photo} alt="Profile" /> : <span>{initials}</span>}</div>
                <div><h3>{builderData.name}</h3><p>{builderData.title}</p></div>
              </div>
              <p>{builderData.subtitle}</p>
              <div className="badge-row">
                {builderData.skills.slice(0, 6).map((skill) => <span className="skill-badge" key={skill}>{skill}</span>)}
              </div>
            </div>

            <div className="workspace-cta" data-animate>
              <button className="button primary large-button" type="button" onClick={openReview} disabled={saving}>{saving ? "Saving..." : "Review Data"}</button>
              <button className="button large-button" type="button" onClick={openPreview}>Skip to Preview</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderReview() {
    return (
      <section className="screen-card review-screen journey-screen">
        <div className="review-heading" data-animate>
          {renderFlowTracker()}
          <p className="eyebrow">Step 3</p>
          <h2>Data visualization and confirmation.</h2>
          <p>Confirm that the portfolio has enough substance before generating the final preview and CV.</p>
        </div>

        <div className="insight-grid">
          <article className="insight-card hero-insight" data-animate>
            <div className="completion-ring" style={{ "--progress": `${dataStats.completion}%` }}>
              <span>{dataStats.completion}%</span>
            </div>
            <h3>Profile completion</h3>
            <p>{dataStats.completion >= 80 ? "Ready for a strong preview." : "Add more identity and contact details for a stronger CV."}</p>
          </article>
          <article className="insight-card" data-animate><span className="insight-number">{dataStats.skills}</span><p>Skills captured</p></article>
          <article className="insight-card" data-animate><span className="insight-number">{dataStats.projects}</span><p>Projects ready</p></article>
          <article className="insight-card" data-animate><span className="insight-number">{dataStats.categories}</span><p>Project categories</p></article>
        </div>

        <div className="review-grid">
          <article className="preview-panel" data-animate>
            <div className="editor-heading"><p className="eyebrow">Skill Density</p><strong>{dataStats.skills} items</strong></div>
            <div className="bar-list">
              {builderData.skills.slice(0, 8).map((skill, index) => (
                <div className="bar-row" key={skill}>
                  <span>{skill}</span>
                  <i style={{ width: `${Math.max(30, 100 - index * 7)}%` }}></i>
                </div>
              ))}
            </div>
          </article>

          <article className="preview-panel" data-animate>
            <div className="editor-heading"><p className="eyebrow">Project Mix</p><strong>{builderData.projects.length} total</strong></div>
            <div className="category-cloud">
              {projectCategories.map((category) => <span key={category}>{category}</span>)}
            </div>
            <div className="confirmation-list">
              <p><strong>Name:</strong> {builderData.name}</p>
              <p><strong>Role:</strong> {builderData.title}</p>
              <p><strong>Contact:</strong> {dataStats.contactCompletion}% complete</p>
            </div>
          </article>
        </div>

        <div className="button-row review-actions" data-animate>
          <button className="button" type="button" onClick={() => changeScreen("information", "Information gathering active.")}>Edit Information</button>
          <button className="button primary large-button" type="button" onClick={openPreview}>Confirm and Preview</button>
        </div>
      </section>
    );
  }

  function renderPreview() {
    return (
      <section className="screen-card preview-screen">
        <div className="preview-topbar" data-animate>
          <div>
            {renderFlowTracker()}
            <p className="eyebrow">Step 4</p>
            <h2>Preview and download CV.</h2>
          </div>
          <div className="button-row">
            <button className="button" type="button" onClick={() => changeScreen("review", "Data visualization and confirmation active.")}>Back to Review</button>
            <button className="button primary" type="button" onClick={downloadCvPdf}>Download CV PDF</button>
          </div>
        </div>

        <div className="preview-hero" data-animate>
          <div className="preview-copy">
            <p className="eyebrow">Final Portfolio</p>
            <h1>{builderData.name}</h1>
            <h2>{builderData.title}</h2>
            <p>{builderData.about}</p>
            <div className="preview-meta">
              <div className="meta-tile"><span>Location</span><strong>{builderData.location}</strong></div>
              <div className="meta-tile"><span>Status</span><strong>{builderData.status}</strong></div>
            </div>
          </div>

          <div className="portrait-shell">
            <div className="portrait-layer layer-one"></div>
            <div className="portrait-layer layer-two"></div>
            <div className="portrait-card">{builderData.photo ? <img src={builderData.photo} alt="Profile" /> : <span>{initials}</span>}</div>
          </div>
        </div>

        <div className="preview-sections">
          <article className="preview-panel" data-animate>
            <p className="eyebrow">Skills</p>
            <div className="badge-row">{builderData.skills.map((skill) => <span className="skill-badge" key={skill}>{skill}</span>)}</div>
          </article>

          <article className="preview-panel" data-animate>
            <div className="editor-heading">
              <p className="eyebrow">Projects</p>
              <div className="filter-row">
                {["All", ...projectCategories].map((category) => (
                  <button className={`tab-chip ${builderData.projectFilter === category ? "active" : ""}`} key={category} type="button" onClick={() => updateBuilderField("projectFilter", category)}>{category}</button>
                ))}
              </div>
            </div>
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <article className="preview-project-card" key={project.id}>
                  <div className="project-cover-shell">
                    <img src={getProjectVisual(project)} alt={`${project.name} cover`} onError={(event) => { event.currentTarget.src = getFallbackProjectVisual(project.name); }} />
                  </div>
                  <p className="eyebrow">{project.category}</p>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  <div className="badge-row">{project.tech.map((tech) => <span className="skill-badge" key={tech}>{tech}</span>)}</div>
                  <div className="button-row">
                    {project.demoUrl ? <a className="button" href={project.demoUrl} target="_blank" rel="noreferrer">Live</a> : null}
                    {project.githubUrl ? <a className="button" href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="preview-panel" data-animate>
            <p className="eyebrow">Contact</p>
            <div className="contact-grid">
              <div className="contact-box"><span>Email</span><strong>{builderData.email}</strong></div>
              <div className="contact-box"><span>Phone</span><strong>{builderData.phone}</strong></div>
              <div className="contact-box"><span>Website</span><strong>{builderData.website}</strong></div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <header className="global-topbar">
        <div><strong>Portfolio Builder</strong><span>{status}</span></div>
        <div className="mini-status"><span>{health.api}</span><span>{health.database}</span></div>
      </header>

      <main className="screen-shell" ref={screenShellRef}>
        {screen === "landing" ? renderLanding() : null}
        {screen === "auth" ? renderAuth() : null}
        {screen === "information" ? renderInformation() : null}
        {screen === "review" ? renderReview() : null}
        {screen === "preview" ? renderPreview() : null}
      </main>

      <div className="page-transition-layer" ref={transitionLayerRef} aria-hidden="true"><span></span><span></span><span></span></div>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function createBuilderState(content) {
  return {
    theme: content.theme || "dark",
    name: content.profile.name,
    title: content.profile.title,
    subtitle: content.profile.subtitle,
    about: content.profile.about,
    location: content.profile.location,
    status: content.profile.status,
    email: content.profile.email,
    phone: content.profile.phone,
    website: content.profile.website,
    photo: "",
    skills: content.skills.flatMap((group) => group.items).slice(0, 10),
    projects: content.projects.map(normalizeProject),
    projectFilter: "All",
  };
}

function mergeWorkspaceIntoBuilder(content, workspace) {
  const merged = createBuilderState(content);
  const profile = workspace.profile || {};

  return {
    ...merged,
    name: profile.name || merged.name,
    title: profile.title || merged.title,
    subtitle: profile.subtitle || merged.subtitle,
    about: profile.about || merged.about,
    location: profile.location || merged.location,
    status: profile.status || merged.status,
    email: profile.email || merged.email,
    phone: profile.phone || merged.phone,
    website: profile.website || merged.website,
    photo: profile.photo || merged.photo,
    skills: workspace.skills?.length ? workspace.skills : merged.skills,
    projects: workspace.projects?.length ? workspace.projects.map(normalizeProject) : merged.projects.map(normalizeProject),
  };
}

function createWorkspacePayload(builderData) {
  return {
    theme: builderData.theme,
    profile: {
      name: builderData.name,
      title: builderData.title,
      subtitle: builderData.subtitle,
      about: builderData.about,
      location: builderData.location,
      status: builderData.status,
      email: builderData.email,
      phone: builderData.phone,
      website: builderData.website,
      photo: builderData.photo,
    },
    skills: builderData.skills,
    projects: builderData.projects,
  };
}

function normalizeProject(project) {
  return {
    ...project,
    coverImage: project.coverImage || "",
    tech: Array.isArray(project.tech) ? project.tech : [],
  };
}

function getProjectVisual(project) {
  if (project.coverImage) {
    return project.coverImage;
  }

  if (project.demoUrl) {
    return `https://image.thum.io/get/width/1200/crop/700/noanimate/${encodeURIComponent(project.demoUrl)}`;
  }

  return getFallbackProjectVisual(project.name);
}

function getFallbackProjectVisual(name) {
  return `https://placehold.co/1200x700/10233a/f5f7fb?text=${encodeURIComponent(name || "Project Preview")}`;
}

export default App;
