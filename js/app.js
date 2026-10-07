// Harish Yeluri · portfolio behaviour: ask box (BM25), skill filter, copy buttons, voice intro
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- copy ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = $(b.dataset.copy), label = b.textContent;
      var ok = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = label; }, 1500); };
      var fb = function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; setTimeout(function () { b.textContent = label; }, 1800); };
      try { navigator.clipboard.writeText(el.textContent.trim()).then(ok, fb); } catch (e) { fb(); }
    });
  });

  /* ---------- scroll spy ---------- */
  var tabs = [].slice.call(document.querySelectorAll(".tabs a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) tabs.forEach(function (a) { a.classList.toggle("on", a.dataset.sec === e.target.id); }); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    tabs.forEach(function (a) { var s = $(a.dataset.sec); if (s) io.observe(s); });
  }

  /* ---------- jump + flash ---------- */
  function go(id) {
    var el = $(id); if (!el) return;
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
  var STOP = "a an the is are was were be been of to in on for with and or by at as it its this that what which who whom how does do did has have had he his him harish i me my you your about can could would should any some tell give show experience know worked work".split(" ");
  var SYN = { llm: "llm gpt claude", genai: "generative llm", gen: "generative", cloud: "aws azure gcp", customer: "stakeholder client", customers: "stakeholder client", money: "cost", cheaper: "cost", fast: "latency", speed: "latency", reliable: "uptime reliability", ml: "machine learning model", job: "roles", visa: "", salary: "", pay: "" };
  function stem(w) { return w.replace(/(ing|ed|es|s)$/, function (m) { return w.length > 4 ? "" : m; }); }
  function toks(s) {
    return s.toLowerCase().replace(/[^a-z0-9#+.\-\s]/g, " ").split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(stem);
  }
  var docs = KB.map(function (k) { return toks(k[1] + " " + k[2] + " " + k[3] + " " + k[3]); });
  var N = docs.length, avg = docs.reduce(function (a, d) { return a + d.length; }, 0) / N, df = {};
  docs.forEach(function (d) { var seen = {}; d.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } }); });
  function bm25(q) {
    var qt = []; toks(q).forEach(function (w) { qt.push(w); if (SYN[w] !== undefined) toks(SYN[w]).forEach(function (x) { qt.push(x); }); });
    var k1 = 1.4, b = .75;
    return docs.map(function (d, i) {
      var s = 0, tf = {};
      d.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
      qt.forEach(function (w) {
        if (!tf[w]) return;
        var idf = Math.log(1 + (N - df[w] + .5) / (df[w] + .5));
        s += idf * (tf[w] * (k1 + 1)) / (tf[w] + k1 * (1 - b + b * d.length / avg));
      });
      return { i: i, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  $("aTrace").innerHTML = '<span>retrieved <b>3</b> chunks</span><span>index <b>' + N + '</b> chunks</span><span>model <b>none: extractive</b></span>';

  var SUGS = ["What has he built with agents?", "Biggest cost win?", "Has he worked directly with customers?", "How does he reduce hallucinations?", "Cloud experience?", "Is he open to relocation and C2C?", "Why Forward Deployed?", "Certifications?"];
  var sugBox = $("sugs");
  SUGS.forEach(function (s) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = s;
    b.addEventListener("click", function () { $("askInput").value = s; run(s); });
    sugBox.appendChild(b);
  });

  var aQ = $("aQ"), aA = $("aA"), aSrcs = $("aSrcs"), aTrace = $("aTrace"), job = 0;
  function srcList(hits) {
    aSrcs.innerHTML = "";
    hits.forEach(function (h, n) {
      var k = KB[h.i], b = document.createElement("button");
      b.type = "button"; b.className = "src";
      b.innerHTML = '<span class="n">[' + (n + 1) + ']</span><span class="s"><b>' + k[1] + '</b> · ' + k[2] + '</span><span class="sc">' + h.s.toFixed(2) + '</span>';
      b.addEventListener("click", function () { go(k[0]); });
      aSrcs.appendChild(b);
    });
  }
  function run(q) {
    q = (q || "").trim(); if (!q) return;
    var my = ++job, t0 = performance.now();
    var hits = bm25(q), top = hits[0].s;
    var keep = hits.filter(function (h, n) { return n < 3 && h.s >= Math.max(1.2, top * .45); });
    var ms = performance.now() - t0;
    aQ.textContent = q;
    if (!keep.length) {
      aA.textContent = "My resume doesn't cover that, so I won't guess. Try asking about agents, RAG, cost, cloud, customers, or the roles I'm looking for.";
      aTrace.innerHTML = '<span>retrieved <b>0</b> chunks above threshold</span><span>search <b>' + ms.toFixed(2) + ' ms</b></span><span>guardrail <b>no answer</b></span>';
      aSrcs.innerHTML = ""; return;
    }
    aTrace.innerHTML = '<span>retrieved <b>' + keep.length + '</b> chunks</span><span>search <b>' + ms.toFixed(2) + ' ms</b></span><span>top BM25 <b>' + top.toFixed(2) + '</b></span><span>model <b>none: extractive</b></span>';
    srcList(keep);
    var parts = keep.map(function (h) { return KB[h.i][2]; });
    if (reduce) { render(parts, keep, Infinity); return; }
    var total = parts.join(" ").length, shown = 0;
    (function tick() {
      if (my !== job) return;
      shown += 4;
      render(parts, keep, shown);
      if (shown < total + parts.length) requestAnimationFrame(tick); else render(parts, keep, Infinity);
    })();
  }
  function render(parts, keep, limit) {
    aA.innerHTML = ""; var used = 0, done = limit === Infinity;
    for (var n = 0; n < parts.length; n++) {
      var p = parts[n], take = Math.max(0, Math.min(p.length, limit - used));
      if (take <= 0) break;
      aA.appendChild(document.createTextNode((n ? " " : "") + p.slice(0, take)));
      used += p.length + 1;
      if (take === p.length) {
        var c = document.createElement("button"); c.type = "button"; c.className = "cite"; c.textContent = n + 1;
        (function (id) { c.addEventListener("click", function () { go(id); }); })(KB[keep[n].i][0]);
        aA.appendChild(c);
      }
    }
    if (!done) { var cr = document.createElement("span"); cr.className = "caret"; aA.appendChild(cr); }
  }
  $("askForm").addEventListener("submit", function (e) { e.preventDefault(); run($("askInput").value); });
  aA.querySelectorAll(".cite").forEach(function (c) { c.addEventListener("click", function () { go(c.dataset.go); }); });
  srcList(bm25("agents langgraph tools mcp crewai").slice(0, 3));

  /* ---------- dependency manifest ---------- */
  var E = window.SKILLS || [];
  var FAM = { lang: "languages", llm: "llms-and-genai", agent: "agents", ml: "ml-and-deep-learning", cloud: "cloud", ops: "mlops-and-infra", data: "data-and-backend", eval: "eval-and-testing", prac: "practices" };
  var NONPROD = ["C#", ".NET", "ASP.NET Core", "TensorFlow"];
  var man = $("manifest"), groups = {};
  Object.keys(FAM).forEach(function (f) {
    var g = document.createElement("div"); g.className = "panel group";
    g.innerHTML = '<h3>[' + FAM[f] + ']<span></span></h3><div class="deps"></div>';
    groups[f] = g; man.appendChild(g);
  });
  E.forEach(function (e) {
    var c = document.createElement("span");
    var prod = e[3] && NONPROD.indexOf(e[1]) < 0;
    c.className = "dep-chip" + (prod ? " prod" : "");
    c.textContent = e[1]; c.dataset.k = (e[1] + " " + e[0] + " " + FAM[e[2]] + " " + e[3]).toLowerCase();
    if (e[3]) c.title = e[3];
    groups[e[2]].querySelector(".deps").appendChild(c);
  });
  function filt() {
    var q = $("skillQ").value.trim().toLowerCase(), shown = 0;
    Object.keys(groups).forEach(function (f) {
      var g = groups[f], n = 0;
      g.querySelectorAll(".dep-chip").forEach(function (c) {
        var m = !q || c.dataset.k.indexOf(q) >= 0;
        c.hidden = !m; c.classList.toggle("match", !!q && m); if (m) n++;
      });
      g.querySelector("h3 span").textContent = n;
      g.classList.toggle("empty", n === 0); shown += n;
    });
    $("skillCount").textContent = shown + " / " + E.length + " skills";
  }
  $("skillQ").addEventListener("input", filt); filt();

  /* ---------- spoken intro ---------- */
  var synth = window.speechSynthesis, introBtn = $("introBtn"), il = introBtn.querySelector("span"), speaking = false, voice = null;
  function pick() { var vs = synth.getVoices().filter(function (v) { return /^en/i.test(v.lang); }); voice = vs.filter(function (v) { return /(male|david|guy|daniel|aaron|alex|rishi|ravi|arthur|tom|ryan|andrew|christopher|eric)/i.test(v.name) && !/female/i.test(v.name); })[0] || vs[0] || null; }
  var INTRO = "Hi, I'm Harish Yeluri, an AI and machine learning engineer based in Overland Park, Kansas, with over four years of experience building production AI. " +
    "At DataRobot, I run an LLM platform serving more than ten thousand inferences a day at ninety-nine point five percent uptime. I built LangGraph agents and a RAG pipeline that improved retrieval accuracy by forty percent, and I cut inference costs by thirty-five percent. " +
    "At Yellow dot A I, I built a Claude-powered assistant and reduced hallucinations from eight percent to two. At Accenture, I built machine learning pipelines for healthcare and banking clients. " +
    "I'm looking for AI and machine learning engineer, generative AI engineer, and forward deployed engineer roles, full-time, W2, or C2C, and I'm open to relocating anywhere in the US. Thanks for stopping by.";
  function reset() { speaking = false; il.textContent = "Hear my intro"; }
  if (synth && typeof SpeechSynthesisUtterance !== "undefined") {
    pick(); try { synth.addEventListener("voiceschanged", pick); } catch (e) {}
    introBtn.hidden = false;
    introBtn.addEventListener("click", function () {
      if (speaking) { synth.cancel(); reset(); return; }
      try { synth.cancel(); var u = new SpeechSynthesisUtterance(INTRO); if (voice) u.voice = voice; u.pitch = .95; u.onend = u.onerror = reset; synth.speak(u); speaking = true; il.textContent = "Stop"; } catch (e) { reset(); }
    });
  }
})();
