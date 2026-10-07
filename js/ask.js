// Ask my resume: BM25 retrieval over the resume, intents for recruiter questions, typo tolerance. Runs fully in the browser.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAP = { stack: "skills", metrics: "moments", hire: "contact", deployments: "experience", evals: "work", card: "card", summary: "summary" };
  function go(id) {
    var el = $(MAP[id] || id); if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }
  /* ---------- knowledge base (from the resumes) ---------- */
  var KB = [
    ["dep-dr","DataRobot · agents","At DataRobot I built production agentic workflows with LangGraph and LangChain: agents that plan multi-step tasks, call tools and APIs, route between models, and keep state and memory with LangGraph state, Redis and vector databases.","agent agents agentic langgraph langchain tool calling planning memory state routing workflow automation"],
    ["dep-dr","DataRobot · integrations","I connected those agents to internal systems through REST APIs, Model Context Protocol (MCP) and Semantic Kernel, and built shared components so new workflows start from one architecture.","mcp model context protocol semantic kernel integration integrate api internal systems tools reusable"],
    ["dep-dr","DataRobot · framework choice","I evaluated LangGraph, LangChain, CrewAI and AutoGen and led the adoption of LangGraph for production agent orchestration and Redis for caching.","crewai autogen framework evaluate decision adoption architecture technology choice"],
    ["dep-dr","DataRobot · platform","I own a production ML/LLM platform serving more than 10,000 inferences a day across GPT-4, Claude and Mistral, from design through deployment, monitoring, versioning and rollback.","platform llm inference production gpt-4 claude mistral own ownership mlops serving deploy deployment scale"],
    ["dep-dr","DataRobot · cost","I cut inference costs by 35% with Redis caching, dynamic model selection, batching and prompt optimization, without losing quality.","cost costs cheap savings save money reduce optimization caching batching redis efficient budget"],
    ["dep-dr","DataRobot · reliability","The platform runs on Docker and Kubernetes with Terraform, GitHub Actions and Argo CD, plus Grafana and Prometheus monitoring, and holds 99.5% uptime.","uptime reliability kubernetes docker terraform cicd ci cd argo github actions monitoring grafana prometheus devops infrastructure sre"],
    ["dep-dr","DataRobot · escalation","I'm the technical escalation point for production AI issues, tracing latency spikes across Kubernetes, scaling and model-serving layers.","escalation incident debugging troubleshooting on-call latency production support issues"],
    ["dep-dr","DataRobot · RAG","I engineered a hybrid semantic-keyword RAG pipeline with BM25 re-ranking that improved retrieval accuracy by 40% and reduced hallucinations in enterprise document search.","rag retrieval search hybrid bm25 rerank re-ranking accuracy documents enterprise vector hallucination"],
    ["dep-dr","DataRobot · evaluation","I built an evaluation framework with quality gates that benchmarks 15+ models on quality, latency and cost to choose models for production.","evaluation eval evals benchmark benchmarking testing quality gates metrics model selection"],
    ["dep-dr","DataRobot · stakeholders","I partner with product owners and business stakeholders to find automation opportunities, define requirements and success criteria, and run demos each iteration.","stakeholder stakeholders customer customers client clients requirements product business demo demos communication forward deployed fde collaborate"],
    ["dep-dr","DataRobot · documentation","I write design and architecture docs, API and integration specs, and operational runbooks so other teams can maintain and extend the systems.","documentation docs runbooks design architecture specs writing"],
    ["dep-dr","DataRobot · mentoring","I mentor 4 junior engineers and lead code reviews on MLOps and AI engineering practices.","mentor mentoring lead leadership code review team junior"],
    ["dep-dr","DataRobot · cloud","On AWS I use EKS, EC2, S3, Lambda, SageMaker and Bedrock; I also integrate GPT-4 through Azure OpenAI with lifecycle management in Azure Machine Learning.","aws cloud eks ec2 s3 lambda sagemaker bedrock azure openai azure ml"],
    ["dep-dr","DataRobot · data","I build SQL and Python ETL pipelines with PostgreSQL, dbt and Airflow that feed model training and retrieval, with automated data-quality checks.","sql etl data pipeline pipelines postgresql dbt airflow data engineering quality"],
    ["dep-ya","Yellow.ai · assistant","At Yellow.ai I built a full-stack generative AI assistant on the Claude API with a FastAPI backend and React and TypeScript front end, handling 1,000+ daily queries under 500 ms and improving support efficiency by 45%.","chatbot assistant claude full stack fullstack react typescript fastapi frontend backend latency support conversational"],
    ["dep-ya","Yellow.ai · API adapters","I wrote custom adapters for 20+ third-party APIs, including systems with limited or inconsistent APIs, handling mismatched formats, authentication differences and rate limits.","integration integrations api apis adapters third party rate limits auth customer systems forward deployed fde messy"],
    ["dep-ya","Yellow.ai · RAG","I built an enterprise RAG system with semantic chunking, context optimization, query refinement and guardrails that cut the hallucination rate from 8% to 2% and raised answer relevance by 35%.","rag hallucination hallucinations guardrails chunking relevance knowledge base retrieval"],
    ["dep-ya","Yellow.ai · fine-tuning","I fine-tuned Llama 2 with LoRA for a 32% accuracy gain on domain tasks, then used GPTQ quantization to make the model 80% smaller.","fine-tuning finetuning fine tune llama lora peft gptq quantization open source model training"],
    ["dep-ya","Yellow.ai · computer vision","I built PyTorch and YOLOv3 object detection models at 92% precision, served by a FastAPI service at 500+ requests per minute with sub-500 ms p95 latency.","computer vision cv yolo pytorch object detection image deep learning"],
    ["dep-ya","Yellow.ai · MLOps","I set up MLflow model versioning and CI/CD with automated testing, which cut manual release work by 60%.","mlflow mlops versioning release ci cd automation testing"],
    ["dep-ya","Yellow.ai · events","I built event-driven integrations with Kafka connecting asynchronous services to downstream systems.","kafka events streaming event-driven asynchronous"],
    ["dep-ya","Yellow.ai · knowledge sharing","I led internal sessions on generative AI, RAG architecture and API integrations for other engineers.","teaching knowledge sharing presentations communication sessions"],
    ["dep-ac","Accenture · churn","At Accenture I built a churn prediction model with 88% accuracy and 0.91 AUC-ROC, tuned with Optuna across 1,000+ configurations.","churn classical machine learning ml model prediction scikit-learn optuna hyperparameter banking"],
    ["dep-ac","Accenture · big data","I built Spark pipelines on Databricks over 5 TB+ of data a week and engineered 40+ features, improving accuracy by 25% and cutting training time by 30%.","spark databricks big data features feature engineering etl scale"],
    ["dep-ac","Accenture · healthcare","I worked on de-identified healthcare data under PHI-handling and access controls, and I know the care regulated data needs.","healthcare health phi hipaa regulated privacy compliance security"],
    ["dep-ac","Accenture · drift","I implemented data drift detection with automated retraining, keeping production data quality at 98%.","drift monitoring retraining data quality"],
    ["dep-ac","Accenture · stakeholders","I explained model decisions and feature importance to non-technical business stakeholders.","explainability explain stakeholders communication business non-technical"],
    ["dep-ac","Accenture · platforms","I deployed containerized ML on Red Hat OpenShift and worked across Azure and Google Cloud (BigQuery, Vertex AI, GKE, Cloud Run).","openshift gcp google cloud bigquery vertex gke cloud run azure"],
    ["summary","Summary","I'm an AI/ML Engineer with 4+ years designing, building and running production AI: LLM applications, RAG pipelines, multi-agent workflows and the ML infrastructure underneath them.","summary overview about who profile introduction background describe"],
    ["card","Roles","I'm looking for AI/ML Engineer, Generative AI Engineer and Forward Deployed Engineer roles.","roles looking job position title ai ml genai forward deployed engineer want"],
    ["card","Work terms","I'm open to full-time, W2 and C2C roles.","w2 c2c full-time fulltime contract employment type terms"],
    ["card","Location","I'm based in Overland Park, Kansas, and I'm open to relocating anywhere in the US.","location relocate relocation remote onsite where based kansas city move"],
    ["card","Certifications","I hold AWS Certified Machine Learning – Specialty, AWS Solutions Architect – Associate and Microsoft Azure AI Engineer Associate, plus DeepLearning.AI and Stanford specializations in generative AI, LangChain, deep learning and machine learning.","certifications certified certificate aws azure microsoft deeplearning stanford"],
    ["dep-edu","Education","I have an MS in Computer Science from the University of Central Missouri (December 2025) and a B.Tech in Electronics and Communication Engineering from JNTU Kakinada (2022, CGPA 9.0/10).","education degree masters ms bachelor btech university college gpa study"],
    ["card","Experience","I have 4+ years of experience building production AI and ML systems, at DataRobot, Yellow.ai and Accenture.","years how long background total career experienced"],
    ["stack","Languages","Python is my main language; I also use SQL, TypeScript, JavaScript, Java, C#, C++, Bash and PowerShell.","python languages programming sql typescript java c# c++ code coding"],
    ["dep-dr","Forward deployed fit","Forward deployed work is what I already do: learn the customer's problem, connect AI to the systems they already use, and stay with it in production until it runs reliably.","forward deployed fde why fit customer field consulting solutions engineer embedded"]
  ];
  /* recruiter questions the resume answers indirectly; contact-only where the resume is silent */
  KB.push(
    ["summary","Strengths","My strengths are taking generative AI from prototype to production and keeping it reliable and affordable at scale (10K+ inferences a day, 99.5% uptime, 35% lower cost), and working directly with the people who use it.","strength strengths good best superpower stand out unique"],
    ["summary","Growth","Each role has pushed me toward more ownership, and now I want to own customer-facing AI systems end to end. I'm happy to talk through specific growth areas in an interview.","weakness weaknesses improve growth challenge"],
    ["summary","Why hire","I've already done the core of these roles in production: I build agents and RAG systems, run the LLM platform they depend on, cut its cost 35% while holding 99.5% uptime, and work directly with stakeholders from requirements to rollout.","why hire fit choose"],
    ["metrics","Proudest result","The result I'm proudest of is the DataRobot LLM platform: 10,000+ inferences a day across GPT-4, Claude and Mistral at 99.5% uptime, with inference cost down 35% and retrieval accuracy up 40%.","achievement proud accomplishment impact win"],
    ["hire","Compensation","I'm happy to discuss compensation directly; it depends on the role, location and whether it's full-time, W2 or C2C. Reach me at harishyeluri8800@gmail.com or +1 (913) 553-0359.","salary compensation pay rate expectation"],
    ["hire","Work authorization","My resume doesn't list work authorization details, so I'd rather confirm them with you directly at harishyeluri8800@gmail.com or +1 (913) 553-0359. I'm open to full-time, W2 and C2C roles.","visa sponsorship authorization h1b opt citizen"],
    ["hire","Availability","I'm open to work now and can agree a start date with you directly.","notice start availability join available"],
    ["card","Remote","I currently work remotely for DataRobot, I'm comfortable onsite or hybrid, and I'll relocate anywhere in the US.","remote onsite hybrid office"],
    ["hire","Hours","I'm available for calls and interviews Monday to Friday, 9:00 AM to 5:00 PM Central Time. Reach me at harishyeluri8800@gmail.com or +1 (913) 553-0359.","hours time call schedule interview timezone central cst weekday"],
    ["card","Travel","I'm open to 100% travel, which suits forward deployed and client-facing roles.","travel travelling traveling client site onsite"],
    ["hire","Contact","Email harishyeluri8800@gmail.com, call +1 (913) 553-0359, or connect on LinkedIn at linkedin.com/in/harish8800. I'm happy to send my resume.","contact email phone call linkedin resume reach"],
    ["dep-dr","Leadership","I lead through technical ownership: I'm the technical owner of the LLM and agentic AI workstreams at DataRobot, I drove the move to LangGraph, and I mentor 4 junior engineers.","lead leadership senior owner"],
    ["dep-dr","Current role","I'm currently a Machine Learning Engineer at DataRobot (since November 2024, remote), owning a production LLM platform and agentic AI workflows.","current currently now present employer"],
    ["card","Looking for","I want roles where I own AI systems end to end, close to the people who use them: AI/ML Engineer, Generative AI Engineer or Forward Deployed Engineer.","looking next goal career want"],
    ["deployments","Industries","I've built AI for healthcare (de-identified patient data under PHI controls), banking (churn prediction and financial data pipelines) and enterprise customer support (AI assistants at Yellow.ai).","industry industries domain healthcare banking finance"],
    ["summary","Ownership","I've worked in fast-growing AI startups (DataRobot and Yellow.ai) as well as at enterprise scale (Accenture). I'm at my best when a problem has no playbook and I have to work out the right approach myself, and I finished my master's while working full time at DataRobot.","startup startups ambiguity ownership playbook small company fast"],
    ["evals","Projects","Highlights: LangGraph agent workflows, a hybrid-search RAG pipeline (+40% retrieval accuracy), a multi-model LLM platform (−35% cost), a Claude support assistant (hallucinations 8% to 2%), a quantized Llama 2 (80% smaller) and a churn model (0.91 AUC-ROC).","projects portfolio built"],
    ["dep-dr","Testing","I test what I ship: pytest unit and integration tests, Postman API checks, Selenium end-to-end tests and Locust and JMeter load tests in CI, plus guardrail testing on LLM outputs.","testing test qa quality pytest selenium load"],
    ["dep-dr","Prompting","Prompt engineering is part of my daily work; prompt optimization was one of the levers behind the 35% inference cost cut.","prompt prompting prompt engineering"],
    ["dep-dr","Security","I implement access controls, logging, model versioning and LLM output guardrails for security and Responsible AI requirements, and I've handled PHI-regulated healthcare data.","security compliance responsible governance privacy"]
  );
  KB.push(
    ["dep-dr","Models used","I've run GPT-4, Claude and Mistral in production at DataRobot, built on the Claude API at Yellow.ai, and fine-tuned Llama 2 with LoRA; I also work with Llama 3, GPT-4o and Gemini.","llm llms models model gpt claude mistral llama gemini"]
  );
  (function applyProfile() {
    var P = window.PROFILE || {}, C = "Reach me at harishyeluri8800@gmail.com or +1 (913) 553-0359.";
    function set(title, text) { for (var i = 0; i < KB.length; i++) if (KB[i][1] === title) KB[i][2] = text; }
    if (P.salary) set("Compensation", "My compensation expectation: " + P.salary + ". I'm flexible depending on the role and location. " + C);
    if (P.workAuthorization) set("Work authorization", "Work authorization: " + P.workAuthorization + ". I'm open to full-time, W2 and C2C roles.");
    if (P.availability) set("Availability", P.availability.replace(/\.?$/, ".") + " I'm open to work now.");
  })();
  var STOP = "a an the is are was were be been of to in on for with and or by at as it its this that what which who whom how does do did has have had he his him harish i me my you your about can could would should any some tell give show experience know worked work".split(" ");
  var SYN = { llm: "llm gpt claude", genai: "generative llm", gen: "generative", cloud: "aws azure gcp", customer: "stakeholder client", customers: "stakeholder client", money: "cost", cheaper: "cost", fast: "latency", speed: "latency", reliable: "uptime reliability", ml: "machine learning model", job: "roles" };
  function stem(w) { return w.replace(/(ing|ed|es|s)$/, function (m) { return w.length > 4 ? "" : m; }); }
  function toks(s) { return s.toLowerCase().replace(/[^a-z0-9#+.\-\s]/g, " ").split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(stem); }
  var docs = KB.map(function (k) { return toks(k[1] + " " + k[2] + " " + k[3] + " " + k[3]); });
  var N = docs.length, avg = docs.reduce(function (a, d) { return a + d.length; }, 0) / N, df = {};
  docs.forEach(function (d) { var seen = {}; d.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } }); });
  function bm25(q) {
    var qt = []; toks(q).forEach(function (w) { qt.push(w); if (SYN[w]) toks(SYN[w]).forEach(function (x) { qt.push(x); }); });
    var k1 = 1.4, b = .75;
    return docs.map(function (d, i) {
      var s = 0, tf = {};
      d.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
      qt.forEach(function (w) { if (!tf[w]) return; var idf = Math.log(1 + (N - df[w] + .5) / (df[w] + .5)); s += idf * (tf[w] * (k1 + 1)) / (tf[w] + k1 * (1 - b + b * d.length / avg)); });
      return { i: i, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  function kb(title) { for (var i = 0; i < KB.length; i++) if (KB[i][1] === title) return i; return -1; }
  function item(i, why) { return { id: KB[i][0], title: KB[i][1], text: KB[i][2], tag: why }; }

  /* common recruiter questions, checked before keyword search */
  var INTENTS = [
    [/\byellow\.?\s?ai\b/i, ["Yellow.ai · assistant", "Yellow.ai · RAG", "Yellow.ai · fine-tuning"]],
    [/\bdata\s?robot\b/i, ["DataRobot · platform", "DataRobot · agents", "DataRobot · cost"]],
    [/\baccenture\b/i, ["Accenture · churn", "Accenture · big data", "Accenture · healthcare"]],
    [/\b(which|what) (llms?|models?|language models?|ai models?)\b|\bllms? (has|have|did)\b/i, ["Models used"]],
    [/\b(mlops|llmops|devops|infrastructure|deploy(ment)?s?|ci\/?cd|pipelines?)\b/i, ["DataRobot · reliability", "Yellow.ai · MLOps", "DataRobot · data"]],
    [/\b(tell me about (yourself|him|harish)|who (are you|is (he|harish))|introduc|overview|summar|background|elevator pitch|about (him|you|harish)\b)/i, ["Summary", "Experience", "Looking for"]],
    [/\b(strength|good at|best at|superpower|stand out|unique|different from)/i, ["Strengths", "DataRobot · platform", "Forward deployed fit"]],
    [/\b(weakness|area to improve|improvement|growth area)/i, ["Growth", "Strengths"]],
    [/\b(why (should|would|do) (we|i|you)|why hire|why (him|you|harish)|good fit|right fit)/i, ["Why hire", "Forward deployed fit", "Proudest result"]],
    [/\b(achievement|proud|accomplish|biggest (win|impact)|impact|best work)/i, ["Proudest result", "DataRobot · RAG", "Yellow.ai · RAG"]],
    [/\b(salary|compensation|pay\b|pay rate|hourly|bill rate|ctc|expectation|package)/i, ["Compensation", "Work terms"]],
    [/\b(visa|sponsor|work authori[sz]ation|authori[sz]ed to work|h-?1b|opt\b|green card|citizen|ead\b|gc\b)/i, ["Work authorization", "Work terms"]],
    [/\b(notice|start date|when can|start working|available to start|availability|joining|join)/i, ["Availability", "Work terms"]],
    [/\b(hours|best time|what time|time ?zone|when (can|could|should) (i|we) (call|reach|talk|speak|meet|schedule)|schedule (a|an) (call|interview|meeting)|available (for|to) (a )?(call|talk|interview)|working hours|office hours)/i, ["Hours", "Contact"]],
    [/\b(travel|travell?ing|client sites?|on the road)/i, ["Travel", "Location"]],
    [/\b(relocat|move to|onsite|on-site|hybrid|remote|where (is|are) (he|you)|based in|location)/i, ["Location", "Remote"]],
    [/\b(w-?2|c2c|1099|contract|full[- ]?time|corp to corp|employment type)/i, ["Work terms", "Availability"]],
    [/\b(contact|email|e-mail|phone|reach (him|you|out)|call (him|you)|linkedin|resume|cv)\b/i, ["Contact"]],
    [/\b(customer|client|forward deployed|fde\b|field)/i, ["Forward deployed fit", "DataRobot · stakeholders", "Yellow.ai · API adapters"]],
    [/\b(lead|leadership|mentor|manage|senior)/i, ["Leadership", "DataRobot · mentoring"]],
    [/\b(team ?work|collaborat|communicat|stakeholder|presentation)/i, ["DataRobot · stakeholders", "Accenture · stakeholders", "Yellow.ai · knowledge sharing"]],
    [/\b(current(ly)?|right now|present (role|job)|where (does|do) (he|you) work|employer)/i, ["Current role"]],
    [/\b(looking for|next role|what (role|kind|type)|career goal|goals|why (is he|are you) looking|leaving)/i, ["Looking for", "Roles"]],
    [/\b(industr|domain|sector|healthcare|banking|finance|fintech)/i, ["Industries", "Accenture · healthcare"]],
    [/\b(startup|ambigu|playbook|fast[- ]paced|ownership|end[- ]to[- ]end)/i, ["Ownership", "DataRobot · platform"]],
    [/\b(projects?|portfolio|what has he built|what have you built)\b/i, ["Projects"]],
    [/\b(test|testing|qa\b|quality assurance)/i, ["Testing", "DataRobot · evaluation"]],
    [/\b(prompt)/i, ["Prompting"]],
    [/\b(security|secure|compliance|hipaa|phi\b|privacy|responsible ai|governance)/i, ["Security", "Accenture · healthcare"]],
    [/\b(years|how long|how much experience|experienced)/i, ["Experience", "Current role"]],
    [/\b(education|degree|master|bachelor|university|college|gpa|cgpa)/i, ["Education"]],
    [/\b(certif)/i, ["Certifications"]]
  ];

  /* any of the 119 skills, by name or common alias */
  var FAMNAME = { lang: "languages", llm: "LLM and generative AI", agent: "agent", ml: "ML and deep learning", cloud: "cloud", ops: "MLOps and infrastructure", data: "data and backend", eval: "evaluation and testing", prac: "working practices" };
  var NOT_PROD = ["C#", ".NET", "ASP.NET Core", "TensorFlow"];
  var ALIAS = { "k8s": "Kubernetes", "kube": "Kubernetes", "gcp": "Google Cloud", "google cloud platform": "Google Cloud", "amazon web services": "AWS", "js": "JavaScript", "node": "JavaScript", "ts": "TypeScript", "sklearn": "scikit-learn", "scikit": "scikit-learn", "huggingface": "Hugging Face", "transformers": "Hugging Face", "llama": "Llama 3", "gpt": "GPT-4o", "gpt-4": "GPT-4o", "openai": "Azure OpenAI", "chatgpt": "GPT-4o", "anthropic": "Claude", "postgres": "PostgreSQL", "sql server": "SQL", "lora": "LoRA / PEFT", "peft": "LoRA / PEFT", "fine-tuning": "LoRA / PEFT", "finetuning": "LoRA / PEFT", "vector database": "Pinecone", "vector db": "Pinecone", "langsmith": "LangChain", "crew ai": "CrewAI", "auto gen": "AutoGen", "model context protocol": "MCP", "gh actions": "GitHub Actions", "ci/cd": "GitHub Actions", "cicd": "GitHub Actions", "argo": "Argo CD", "w&b": "Weights & Biases", "wandb": "Weights & Biases", "spark": "Spark", "pyspark": "Spark", "react.js": "React", "reactjs": "React", "dotnet": ".NET", "springboot": "Spring Boot", "yolov3": "YOLO", "cv": "Computer vision", "nlp": "Hugging Face", "llmops": "MLflow", "mlops": "MLflow", "docker compose": "Docker", "grafana": "Grafana" };
  var SK = (window.SKILLS || []).map(function (e) { return { sym: e[0], name: e[1], fam: e[2], note: e[3] }; });
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function findSkills(q) {
    var low = " " + q.toLowerCase() + " ", hits = [], seen = {};
    function add(name) { if (seen[name]) return; for (var i = 0; i < SK.length; i++) if (SK[i].name === name) { seen[name] = 1; hits.push(SK[i]); return; } }
    Object.keys(ALIAS).forEach(function (k) { if (new RegExp("[^a-z0-9]" + esc(k) + "[^a-z0-9]").test(low)) add(ALIAS[k]); });
    SK.forEach(function (s) {
      var names = [s.name.toLowerCase()].concat(s.name.indexOf(" / ") > 0 ? s.name.toLowerCase().split(" / ") : []);
      names.forEach(function (n) { if (n.length > 1 && new RegExp("[^a-z0-9]" + esc(n) + "[^a-z0-9]").test(low)) add(s.name); });
    });
    return hits.slice(0, 3);
  }
  function skillItem(s) {
    var prod = s.note && NOT_PROD.indexOf(s.name) < 0;
    var note = s.note ? " " + s.note.replace(/\.?$/, ".") : "";
    var text = prod ? "Yes, " + s.name + "." + note : "Yes, " + s.name + " is part of my " + FAMNAME[s.fam] + " toolkit." + note;
    return { id: "stack", title: "Skills · " + s.name, text: text, tag: prod ? "skill · prod" : "skill" };
  }

  /* ---------- typo tolerance: snap misspelled words to known vocabulary ---------- */
  var VOCAB = {};
  KB.forEach(function (k) { (k[1] + " " + k[2] + " " + k[3]).toLowerCase().split(/[^a-z0-9+#.]+/).forEach(function (w) { if (w.length > 3) VOCAB[w] = 1; }); });
  SK.forEach(function (s) { s.name.toLowerCase().split(/[^a-z0-9+#.]+/).forEach(function (w) { if (w.length > 3) VOCAB[w] = 1; }); });
  ("salary compensation experience experienced years expectation expectations sponsorship authorization relocation relocate remote onsite hybrid " +
   "available availability notice contact email phone resume strengths strength weakness weaknesses achievement achievements leadership mentor " +
   "projects certification certifications education degree customer customers client clients stakeholder stakeholders kubernetes python " +
   "langgraph langchain machine learning generative engineer forward deployed hire hiring interview location based contract fulltime").split(" ").forEach(function (w) { VOCAB[w] = 1; });
  var VLIST = Object.keys(VOCAB);
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j2;
    for (j2 = 0; j2 <= b.length; j2++) prev[j2] = j2;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var best = i;
      for (j2 = 1; j2 <= b.length; j2++) {
        cur[j2] = Math.min(prev[j2] + 1, cur[j2 - 1] + 1, prev[j2 - 1] + (a[i - 1] === b[j2 - 1] ? 0 : 1));
        if (i > 1 && j2 > 1 && a[i - 1] === b[j2 - 2] && a[i - 2] === b[j2 - 1]) cur[j2] = Math.min(cur[j2], prev[j2 - 2] + 1);
        if (cur[j2] < best) best = cur[j2];
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function correct(q) {
    var fixes = [];
    var out = q.replace(/(^|[^A-Za-z])([a-z][A-Za-z+#]{4,})/g, function (all, pre, w) {
      var lw = w.toLowerCase();
      if (VOCAB[lw] || STOP.indexOf(lw) >= 0) return pre + w;
      var max = lw.length >= 8 ? 2 : 1, bestW = null, bestD = max + 1;
      for (var i = 0; i < VLIST.length; i++) { var d = lev(lw, VLIST[i], max); if (d < bestD) { bestD = d; bestW = VLIST[i]; if (d === 1 && max === 1) break; } }
      if (bestW && bestD <= max) { fixes.push(w + " → " + bestW); return pre + bestW; }
      return pre + w;
    });
    return { q: out, fixes: fixes };
  }

  /* ---------- "how many years of X": durations from the actual work history ---------- */
  var ROLES = { dr: ["DataRobot", 2024, 11, 0, 0], ya: ["Yellow.ai", 2023, 4, 2024, 1], ac: ["Accenture", 2021, 11, 2023, 3] };
  var AT = {
    dr: "Python SQL Bash Flask LangGraph LangChain MCP Semantic Kernel CrewAI AutoGen Tool calling Multi-agent Agent evaluation RAG Hybrid search Claude GPT-4o Mistral Prompting Guardrails Responsible AI AWS Bedrock SageMaker EKS EC2 S3 Lambda IAM Azure Azure OpenAI Docker Kubernetes Terraform GitHub Actions Argo CD Grafana Prometheus MLflow Redis PostgreSQL Airflow dbt REST APIs Microservices LLM evaluation Quality gates pytest Postman Selenium JMeter Locust GitHub Copilot Solution design Requirements Stakeholder demos Escalation Runbooks Estimation Agile / Scrum Mentoring Code review",
    ya: "Python Claude RAG Semantic chunking Guardrails Prompting LoRA / PEFT GPTQ Llama 3 PyTorch YOLO Computer vision FastAPI React TypeScript Kafka MLflow REST APIs pytest Postman Selenium JMeter Locust GitHub Copilot Azure Azure OpenAI AKS Data Factory Google Cloud BigQuery GKE Cloud Run Quality gates Agile / Scrum",
    ac: "Python SQL scikit-learn Optuna Spark Databricks Feature engineering Drift detection Azure Data Factory AKS Google Cloud BigQuery Vertex AI GKE Cloud Run OpenShift Kafka"
  };
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function usedAt(name) {
    var keys = [];
    Object.keys(AT).forEach(function (k) { if ((" " + AT[k] + " ").indexOf(" " + name + " ") >= 0) keys.push(k); });
    return keys;
  }
  function span(k) {
    var r = ROLES[k], now = new Date(), ey = r[3] || now.getFullYear(), em = r[4] || now.getMonth() + 1;
    return { name: r[0], months: (ey - r[1]) * 12 + (em - r[2]) + 1, label: MON[r[2] - 1] + " " + r[1] + " to " + (r[3] ? MON[r[4] - 1] + " " + r[3] : "now") };
  }
  function dur(m) {
    if (m < 12) return "about " + m + " months";
    var y = Math.floor(m / 12), r = m % 12;
    if (r >= 9) return "almost " + (y + 1) + " years";
    return y + (r ? "+" : "") + " year" + (y > 1 || r ? "s" : "");
  }
  function yearsItem(s) {
    var keys = usedAt(s.name);
    if (!keys.length) return { id: "stack", title: "Skills · " + s.name, text: s.name + " is in my toolkit, though my resume doesn't tie it to a specific role, so I'd rather walk you through where I've used it in a conversation.", tag: "skill" };
    var spans = keys.map(span), total = spans.reduce(function (a, b) { return a + b.months; }, 0);
    var where = spans.map(function (x) { return x.name + " (" + x.label + ")"; });
    var list = where.length > 1 ? where.slice(0, -1).join(", ") + " and " + where[where.length - 1] : where[0];
    return { id: "deployments", title: "Experience · " + s.name, text: "I have " + dur(total) + " of hands-on " + s.name + " experience, at " + list + ".", tag: "work history" };
  }
  var YEARS_RE = /\b(how (many|much|long)|years?|yrs?|months?|experience (in|with|on)|exp (in|with|on)|worked (with|on)|hands[- ]on)\b/i;

  function answer(q0) {
    var fix = correct(q0), q = fix.q;
    var out = [], used = {}, how = "";
    function push(it) { if (it && !used[it.title] && out.length < 3) { used[it.title] = 1; out.push(it); } }
    var sk0 = findSkills(q);
    if (sk0.length && YEARS_RE.test(q)) { how = "years"; sk0.forEach(function (s) { push(yearsItem(s)); }); }
    if (!sk0.length) {
      var m = q.match(/\b(?:with|in|on|of|know|knows|use|used|using)\s+([A-Za-z][\w.+#-]{1,})\s*\??\s*$/i);
      var GENERIC = "experience total overall it this that them industry production ai ml genai team teams customers clients cloud data python years general us usa".split(" ");
      if (m) {
        var term = m[1].toLowerCase().replace(/[?.]+$/, "");
        if (!VOCAB[term] && GENERIC.indexOf(term) < 0 && STOP.indexOf(term) < 0 && !bm25(term)[0].s) {
          how = "unknown";
          var shown = m[1].replace(/[?.]+$/, ""); shown = shown.charAt(0).toUpperCase() + shown.slice(1);
          out.push({ id: "stack", title: "Not on my resume", text: shown + " isn't on my resume, so I won't claim experience with it. I pick up new tools quickly; here's the closest related work:", tag: "honest" });
          used["Not on my resume"] = 1;
        }
      }
    }
    for (var n = 0; n < INTENTS.length && out.length < 3; n++) {
      if (how === "years" && INTENTS[n][1][0] === "Experience") continue;
      if (INTENTS[n][0].test(q)) { if (!how) how = "intent"; INTENTS[n][1].forEach(function (t) { var i = kb(t); if (i >= 0) push(item(i, "intent")); }); }
    }
    var sk = findSkills(q);
    if (sk.length) { if (!how) how = "skill"; sk.forEach(function (s) { push(skillItem(s)); }); }
    var hits = bm25(q), top = hits[0] ? hits[0].s : 0;
    if (!out.length && top > 0) {
      how = top >= 2.5 ? "bm25" : "nearest";
      hits.filter(function (h, i) { return i < 3 && h.s >= Math.max(.6, top * .45); }).forEach(function (h) { push(item(h.i, "bm25 " + h.s.toFixed(2))); });
    } else if (out.length < 2 && top >= 4) {
      push(item(hits[0].i, "bm25 " + top.toFixed(2)));
    }
    if (how === "unknown" && out.length < 3) { push(item(kb("Ownership"), "related")); push(item(kb("Summary"), "related")); }
    if (!out.length) { how = "fallback"; push(item(kb("Summary"), "fallback")); push(item(kb("Contact"), "fallback")); }
    return { items: out, how: how, top: top, fixes: fix.fixes };
  }

  $("aTrace").innerHTML = '<span>index <b>' + N + '</b> chunks + <b>' + SK.length + '</b> skills</span><span>model <b>none: extractive</b></span>';

  var POOL = ["Tell me about yourself", "Why should we hire him?", "How many years of Python?", "Does he know Kubernetes?", "Biggest achievement?",
    "Salary expectations?", "Work authorization?", "When can he start?", "Open to relocation?", "W2 or C2C?", "Customer-facing experience?",
    "How much LangGraph experience?", "What has he built with RAG?", "Leadership experience?", "Cloud experience?", "Strengths?", "Certifications?",
    "Healthcare experience?", "How does he cut LLM costs?", "Experience with AWS Bedrock?", "Remote or onsite?", "How do I contact him?", "Does he know React?", "Education?"];
  var sugBox = $("sugs");
  function shuffleSugs() {
    sugBox.innerHTML = "";
    var lab = document.createElement("span"); lab.className = "sug-label"; lab.textContent = "Examples · ask in your own words";
    sugBox.appendChild(lab);
    POOL.slice().sort(function () { return Math.random() - .5; }).slice(0, 6).forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = s;
      b.addEventListener("click", function () { $("askInput").value = s; run(s); });
      sugBox.appendChild(b);
    });
    var more = document.createElement("button"); more.type = "button"; more.className = "sug-more"; more.textContent = "↻ More examples";
    more.addEventListener("click", shuffleSugs);
    sugBox.appendChild(more);
  }
  shuffleSugs();
  $("askInput").placeholder = "Type any question: experience, skills, salary, visa, start date…";

  var aQ = $("aQ"), aA = $("aA"), aSrcs = $("aSrcs"), aTrace = $("aTrace"), job = 0;
  function srcList(items) {
    aSrcs.innerHTML = "";
    items.forEach(function (it, n) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "src";
      b.innerHTML = '<span class="n">[' + (n + 1) + ']</span><span class="s"><b>' + it.title + '</b> · ' + it.text + '</span><span class="sc">' + it.tag + '</span>';
      b.addEventListener("click", function () { go(it.id); });
      aSrcs.appendChild(b);
    });
  }
  var LEAD = { nearest: "The closest thing in my resume: ", fallback: "That isn't covered in my resume, so I won't make something up. Here's the short version, and I'm glad to answer it directly: " };
  function run(q) {
    q = (q || "").trim(); if (!q) return;
    var my = ++job, t0 = performance.now(), r = answer(q), ms = performance.now() - t0;
    aQ.textContent = q;
    var labels = { unknown: "not on resume", years: "work history", intent: "recruiter question", skill: "skill lookup", bm25: "BM25 search", nearest: "nearest match", fallback: "not in resume" };
    aTrace.innerHTML = (r.fixes.length ? '<span>read as <b>' + r.fixes.join(", ") + '</b></span>' : '') + '<span>route <b>' + labels[r.how] + '</b></span><span>sources <b>' + r.items.length + '</b></span><span>search <b>' + ms.toFixed(2) + ' ms</b></span><span>model <b>none: extractive</b></span>';
    srcList(r.items);
    var parts = r.items.map(function (it) { return it.text; });
    if (LEAD[r.how]) parts[0] = LEAD[r.how] + parts[0];
    var ids = r.items.map(function (it) { return it.id; });
    if (reduce) { render(parts, ids, Infinity); return; }
    var total = parts.join(" ").length, shown = 0;
    (function tick() {
      if (my !== job) return;
      shown += 4;
      render(parts, ids, shown);
      if (shown < total + parts.length) requestAnimationFrame(tick); else render(parts, ids, Infinity);
    })();
  }
  function render(parts, ids, limit) {
    aA.innerHTML = ""; var used = 0, done = limit === Infinity;
    for (var n = 0; n < parts.length; n++) {
      var p = parts[n], take = Math.max(0, Math.min(p.length, limit - used));
      if (take <= 0) break;
      aA.appendChild(document.createTextNode((n ? " " : "") + p.slice(0, take)));
      used += p.length + 1;
      if (take === p.length) {
        var c = document.createElement("button"); c.type = "button"; c.className = "cite"; c.textContent = n + 1;
        (function (id) { c.addEventListener("click", function () { go(id); }); })(ids[n]);
        aA.appendChild(c);
      }
    }
    if (!done) { var cr = document.createElement("span"); cr.className = "caret"; aA.appendChild(cr); }
  }
  /* the Ask button and the Enter key both work without a form submit, so sandboxed previews behave the same */
  $("askBtn").addEventListener("click", function () { run($("askInput").value); });
  $("askInput").addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); run($("askInput").value); } });
  $("askForm").addEventListener("submit", function (e) { e.preventDefault(); run($("askInput").value); });
  aA.querySelectorAll(".cite").forEach(function (c) { c.addEventListener("click", function () { go(c.dataset.go); }); });
  srcList(answer("langgraph agents tool calling mcp crewai autogen").items);

  window.__ask = { run: run };
})();

// ---------- Availability hours: Mon to Fri, 9:00 AM to 5:00 PM Central, shown live in the visitor's time too ----------
(function () {
  var TZ = "America/Chicago", OPEN = 9, CLOSE = 17;
  var status = document.querySelectorAll("[data-hours-status]"), local = document.querySelectorAll("[data-hours-local]");
  if (!status.length && !local.length) return;
  function partsIn(date) {
    var p = {}; new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false })
      .formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { wd: p.weekday, y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute };
  }
  function chicagoToDate(y, mo, d, h) {
    var guess = new Date(Date.UTC(y, mo - 1, d, h, 0));
    var p = partsIn(guess), asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
    return new Date(guess.getTime() - (asUtc - guess.getTime()));
  }
  function tick() {
    try {
      var now = new Date(), p = partsIn(now), weekday = ["Mon","Tue","Wed","Thu","Fri"].indexOf(p.wd) >= 0, mins = p.h * 60 + p.mi;
      var open = weekday && mins >= OPEN * 60 && mins < CLOSE * 60, text;
      if (open) text = "Available now";
      else {
        var days = { Sun: 1, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 2 }[p.wd];
        if (weekday && mins >= CLOSE * 60) days = p.wd === "Fri" ? 3 : 1;
        var when = days === 0 ? "today" : days === 1 ? "tomorrow" : "Monday";
        text = "Back " + when + " at 9:00 AM CT";
      }
      status.forEach(function (el) { el.textContent = text; el.classList.toggle("open", open); });
      var myTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (myTz && myTz !== TZ) {
        var a = chicagoToDate(p.y, p.mo, p.d, OPEN), b = chicagoToDate(p.y, p.mo, p.d, CLOSE);
        var f = function (d) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
        local.forEach(function (el) { el.textContent = "That's " + f(a) + " to " + f(b) + " your time"; });
      }
    } catch (e) {}
  }
  tick(); setInterval(tick, 60000);
})();
