export const sampleSiteContent = {
  seo: {
    title: "Sher Singh | Jr. DevOps Engineer",
    description:
      "Premium portfolio for Sher Singh featuring DevOps projects, AI assistant, resume, GitHub analytics, terminal mode, and dashboard experiences.",
    keywords: [
      "Sher Singh",
      "DevOps Engineer",
      "Docker",
      "Prometheus",
      "Grafana",
      "Loki",
      "Netdata",
      "MongoDB",
      "Node.js",
      "React",
    ],
  },
  profile: {
    name: "Sher Singh",
    title: "Jr. DevOps Engineer",
    subtitle: "Linux, automation, monitoring, and platform reliability",
    location: "Jaipur, Rajasthan, India",
    status: "Open to DevOps, SRE, and infrastructure support opportunities",
    email: "sher@example.com",
    phone: "+91 98765 43210",
    whatsapp: "https://wa.me/919876543210",
    website: "http://portfolio.localhost",
    resumeUrl: "/resume-placeholder.pdf",
    heroSummary:
      "I build reliable systems, automate repetitive operations, and support observability stacks across Linux-first environments.",
    about:
      "I work across Ubuntu, Windows Server support environments, Dockerized services, monitoring pipelines, and production troubleshooting. My background includes Mirasys VMS support, infrastructure basics, networking, and hands-on full-stack tooling for operational automation.",
    socialLinks: [
      { label: "GitHub", url: "https://github.com/shersingh", icon: "GH" },
      { label: "LinkedIn", url: "https://linkedin.com/in/shersingh", icon: "IN" },
      { label: "Email", url: "mailto:sher@example.com", icon: "EM" },
      { label: "WhatsApp", url: "https://wa.me/919876543210", icon: "WA" },
    ],
    metrics: [
      { label: "Years Learning Ops", value: "2+" },
      { label: "Monitoring Stack", value: "Prometheus + Grafana + Loki" },
      { label: "Primary Platforms", value: "Ubuntu, Docker, MongoDB" },
    ],
  },
  suggestedQuestions: [
    "What DevOps tools does Sher Singh use most?",
    "Show me projects related to monitoring and automation.",
    "What is Sher's experience with Docker and Linux?",
    "Summarize Sher Singh's resume for an SRE role.",
  ],
  skills: [
    {
      category: "DevOps",
      level: 84,
      items: ["CI/CD basics", "Automation", "Troubleshooting", "Incident support"],
    },
    {
      category: "Linux",
      level: 86,
      items: ["Ubuntu", "Shell scripting", "Service management", "Permissions"],
    },
    {
      category: "Docker",
      level: 82,
      items: ["Docker Compose", "Container debugging", "Image builds"],
    },
    {
      category: "Kubernetes",
      level: 54,
      items: ["Pods", "Deployments", "Services", "Learning in progress"],
    },
    {
      category: "Cloud",
      level: 58,
      items: ["Virtual machines", "Basic cloud deployments", "Networking"],
    },
    {
      category: "Networking",
      level: 75,
      items: ["DNS", "Ports", "Reverse proxies", "Firewall basics"],
    },
    {
      category: "Monitoring",
      level: 88,
      items: ["Prometheus", "Grafana", "Loki", "Netdata"],
    },
    {
      category: "Backend",
      level: 72,
      items: ["Node.js", "Express", "REST APIs", "Automation scripts"],
    },
    {
      category: "Frontend",
      level: 66,
      items: ["React", "Vite", "Responsive UI", "Dashboards"],
    },
    {
      category: "Database",
      level: 70,
      items: ["MongoDB", "Mongoose", "Data modeling"],
    },
    {
      category: "Security",
      level: 61,
      items: ["Access basics", "Secrets awareness", "Least privilege"],
    },
  ],
  experience: [
    {
      id: "exp-1",
      period: "2024 - Present",
      title: "Jr. DevOps Engineer",
      company: "Infrastructure & Support Projects",
      summary:
        "Working across containerized apps, reverse proxies, monitoring tools, and platform troubleshooting with a strong Linux focus.",
      milestones: [
        "Managed Docker-based local and service environments",
        "Worked with Prometheus, Grafana, Loki, and Netdata concepts",
        "Improved troubleshooting workflows for deployment and monitoring issues",
      ],
    },
    {
      id: "exp-2",
      period: "2023 - 2024",
      title: "Technical Support / Systems Exposure",
      company: "Mirasys VMS Support",
      summary:
        "Supported video management systems, handled operational issues, and developed practical comfort with Windows Server environments and networking.",
      milestones: [
        "Investigated support tickets and system issues",
        "Worked with endpoint and server-side diagnostics",
        "Gained hands-on exposure to networking and infrastructure dependencies",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      period: "2019 - 2023",
      title: "Bachelor's Degree",
      organization: "Engineering / Technical Education",
      summary: "Built the base for software, systems, and practical operations learning.",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Docker Foundations",
      issuer: "Placeholder Academy",
      verifyUrl: "https://example.com/verify/docker-foundations",
      pdfPreview: "/certificates/docker-foundations.pdf",
    },
    {
      id: "cert-2",
      title: "Monitoring with Prometheus & Grafana",
      issuer: "Placeholder Academy",
      verifyUrl: "https://example.com/verify/monitoring",
      pdfPreview: "/certificates/monitoring.pdf",
    },
  ],
  achievements: [
    "Built a Docker-ready personal portfolio with API-driven content and monitoring dashboard concepts.",
    "Created reusable local development flows with reverse proxy and health checks.",
    "Improved operational confidence across Linux, Node.js, MongoDB, and observability stacks.",
  ],
  testimonials: [
    {
      id: "t-1",
      quote: "Sher works with urgency and learns infrastructure tooling by doing real debugging work.",
      author: "Team Lead",
      company: "Operations Team",
      logo: "Company Logo",
    },
    {
      id: "t-2",
      quote: "Strong practical mindset on Linux, monitoring, and environment setup issues.",
      author: "Senior Engineer",
      company: "Platform Group",
      logo: "Company Logo",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Observability Starter Stack",
      category: "Monitoring",
      summary: "A local-first monitoring stack using Prometheus, Grafana, Loki, and Netdata concepts.",
      tech: ["Docker", "Prometheus", "Grafana", "Loki", "Netdata"],
      githubUrl: "https://github.com/shersingh/observability-starter",
      demoUrl: "https://demo.example.com/observability-starter",
      metrics: ["Reduced troubleshooting time by 30%", "Centralized metrics and logs"],
      architecture:
        "Docker Compose orchestrates metrics collection, visualization, logging, and a sample app layer behind a reverse proxy.",
      challenges:
        "Service discovery, health checks, and getting multiple tools to cooperate locally without brittle startup ordering.",
      solutions:
        "Used container health checks, simpler network boundaries, and dashboard defaults for faster debugging.",
      screenshots: ["Dashboard Placeholder", "Metrics Placeholder"],
      caseStudy:
        "This project demonstrates how Sher approaches operational visibility by connecting metrics, logs, and system health into one developer-friendly workspace.",
    },
    {
      id: "proj-2",
      name: "Portfolio Builder Platform",
      category: "Full Stack",
      summary: "A Docker-ready React and Express portfolio platform with admin, AI, and user auth foundations.",
      tech: ["React", "Node.js", "Express", "MongoDB", "Docker"],
      githubUrl: "https://github.com/shersingh/portfolio-builder",
      demoUrl: "http://portfolio.localhost",
      metrics: ["Single command local boot", "User portfolio persistence foundation"],
      architecture:
        "React client, Express API, MongoDB persistence, and Caddy reverse proxy managed with Docker Compose.",
      challenges:
        "Keeping local development, browser domain behavior, and proxy health checks aligned without adding heavy tooling.",
      solutions:
        "Introduced environment-aware Vite proxying, stable localhost domain usage, and simplified service health checks.",
      screenshots: ["Hero Placeholder", "Admin Placeholder"],
      caseStudy:
        "This project reflects Sher's combined frontend and DevOps interests by blending product UI, APIs, Docker workflows, and operational polish.",
    },
    {
      id: "proj-3",
      name: "Automation Scripts Hub",
      category: "Automation",
      summary: "A collection of shell and Node.js workflows for repeatable environment setup and diagnostics.",
      tech: ["Bash", "Node.js", "Linux", "Automation"],
      githubUrl: "https://github.com/shersingh/automation-scripts-hub",
      demoUrl: "https://example.com/automation-scripts-hub",
      metrics: ["Faster environment bootstrap", "Reduced manual setup repetition"],
      architecture:
        "CLI-first scripts with parameterized commands, environment checks, and reusable operational actions.",
      challenges: "Handling cross-environment path issues and ensuring scripts remained understandable to new users.",
      solutions: "Used small focused scripts, stronger messaging, and documented prerequisites up front.",
      screenshots: ["Script Output Placeholder", "Setup Flow Placeholder"],
      caseStudy:
        "This work showcases Sher's interest in reducing repetitive setup work and packaging operational knowledge into scripts.",
    },
  ],
  github: {
    pinnedRepos: [
      { name: "portfolio-builder", stars: 12, forks: 4, language: "JavaScript" },
      { name: "observability-starter", stars: 9, forks: 2, language: "Docker" },
      { name: "automation-scripts-hub", stars: 7, forks: 1, language: "Shell" },
    ],
    repositories: 18,
    commitsLastYear: 346,
    stars: 41,
    forks: 13,
    languages: [
      { name: "JavaScript", percentage: 42 },
      { name: "Shell", percentage: 24 },
      { name: "Dockerfile", percentage: 14 },
      { name: "YAML", percentage: 11 },
      { name: "CSS", percentage: 9 },
    ],
    recentActivity: [
      "Shipped Docker and proxy fixes for local development",
      "Expanded site UI into AI, resume, admin, and dashboard sections",
      "Added user authentication foundation for saved workspaces",
    ],
    contributionGraph: "Contribution graph placeholder",
  },
  devopsDashboard: {
    uptime: "14d 08h 33m",
    cpu: 36,
    ram: 62,
    disk: 48,
    containers: [
      { name: "client", status: "healthy" },
      { name: "server", status: "healthy" },
      { name: "mongo", status: "healthy" },
      { name: "proxy", status: "healthy" },
    ],
    links: [
      { label: "Prometheus", url: "http://localhost:9090" },
      { label: "Grafana", url: "http://localhost:3000" },
      { label: "Loki", url: "https://grafana.com/oss/loki/" },
      { label: "Netdata", url: "https://www.netdata.cloud/" },
    ],
    healthSummary:
      "System health looks stable, with monitoring, logging, and container orchestration concepts represented for future live integrations.",
  },
  blogPosts: [
    {
      id: "blog-1",
      title: "Fixing Local Docker Networking Without Overengineering It",
      category: "DevOps",
      tags: ["Docker", "Networking", "Caddy"],
      readingTime: "6 min read",
      excerpt:
        "A practical breakdown of local domain routing, reverse proxies, and browser-safe hostnames for containerized apps.",
      content:
        "Markdown-ready post placeholder.\n\n```bash\ndocker compose up --build\n```\n\nKey idea: solve the actual networking problem before adding complexity.",
      related: ["blog-2"],
      aiSummary:
        "AI summary placeholder: This post explains how to stabilize local reverse proxy flows with less friction.",
    },
    {
      id: "blog-2",
      title: "Prometheus, Grafana, and Loki for Beginners Who Need Real Signals",
      category: "Monitoring",
      tags: ["Prometheus", "Grafana", "Loki"],
      readingTime: "8 min read",
      excerpt:
        "A beginner-friendly walkthrough of why metrics, logs, and dashboards matter when you're responsible for uptime.",
      content:
        "Markdown-ready monitoring article placeholder with code blocks and diagrams described in prose.",
      related: ["blog-1"],
      aiSummary:
        "AI summary placeholder: This article introduces observability building blocks and how they fit together.",
    },
  ],
  adminCollections: [
    "projects",
    "blogs",
    "skills",
    "resume",
    "certifications",
    "testimonials",
    "settings",
  ],
};

export function cloneSiteContent() {
  return JSON.parse(JSON.stringify(sampleSiteContent));
}
