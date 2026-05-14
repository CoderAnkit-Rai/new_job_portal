const pptxgen = require('pptxgenjs');
const pres = new pptxgen();

pres.author = 'JobCompass';
pres.company = 'Capgemini';
pres.revision = '1';
pres.subject = 'Final Year Project Presentation';
pres.title = 'JobCompass Presentation';

// Slide 1: Title
let slide1 = pres.addSlide();
slide1.addText('JobCompass', { x: 1, y: 1.5, w: '80%', h: 1, fontSize: 48, bold: true, color: '003366', align: 'center' });
slide1.addText('A Microservices-Based Job Portal Management System\nFinal Year Project Presentation', { x: 1, y: 2.5, w: '80%', h: 1, fontSize: 24, color: '333333', align: 'center' });

// Slide 2: Project Overview
let slide2 = pres.addSlide();
slide2.addText('Project Objective & Scope', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide2.addText([
    { text: 'Problem Statement:', options: { bold: true } },
    { text: ' Traditional monolithic job portals struggle with scaling distinct features like search indexing, resume processing, and notification handling simultaneously.', options: { breakLine: true } },
    { text: '\nObjective:', options: { bold: true } },
    { text: ' To build a highly scalable, fault-tolerant job portal utilizing a microservices architecture to decouple business domains.', options: { breakLine: true } },
    { text: '\nTarget Users:', options: { bold: true } },
    { text: ' Job Seekers, Recruiters, and System Administrators.', options: { breakLine: true } },
    { text: '\nScope:', options: { bold: true } },
    { text: ' Complete end-to-end flow from user registration and resume management to job posting, searching, and application tracking.' }
], { x: 0.5, y: 1.2, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 3: Technology Stack
let slide3 = pres.addSlide();
slide3.addText('Technologies & Frameworks', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide3.addTable([
    [{ text: 'Layer', options: { bold: true } }, { text: 'Technologies Used', options: { bold: true } }],
    ['Frontend', 'Angular 21 (Standalone), TailwindCSS 4, Chart.js, Lucide Icons'],
    ['Backend', 'Java 17, Spring Boot 3.x, Spring Cloud (Eureka, Config, Gateway)'],
    ['Database', 'PostgreSQL 15 (Database-per-service pattern)'],
    ['Messaging', 'RabbitMQ 3 (Topic Exchange, Event-Driven)'],
    ['Caching', 'Redis 7 (10-min TTL caching)'],
    ['DevOps', 'Docker, Docker Compose, GitHub Actions (SonarCloud)']
], { x: 0.5, y: 1.5, w: 9.0, colW: [2.0, 7.0], fill: 'F1F1F1', fontSize: 14, color: '333333', border: { type: 'solid', pt: 1, color: 'CCCCCC' } });

// Slide 4: System Architecture
let slide4 = pres.addSlide();
slide4.addText('High-Level Microservices Architecture', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide4.addText([
    { text: 'Client Layer: Angular SPA communicating via HTTP REST.', options: { breakLine: true } },
    { text: 'API Gateway (api-gateway): Central entry point, handles JWT validation and routing.', options: { breakLine: true } },
    { text: 'Service Registry (eureka-server): Dynamic service discovery.', options: { breakLine: true } },
    { text: 'Business Microservices: User, Job, Application, Resume, Search, and Notification services.', options: { breakLine: true } },
    { text: 'Event Bus: RabbitMQ facilitating asynchronous domain events.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 5: Frontend Folder Structure
let slide5 = pres.addSlide();
slide5.addText('Angular 21 Frontend Structure', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide5.addText([
    { text: 'Standalone Components: Entirely free of NgModules, promoting better tree-shaking and lazy loading.', options: { breakLine: true } },
    { text: 'Core (/core): Contains AuthService, AuthInterceptor, and functional guards (authGuard, roleGuard).', options: { breakLine: true } },
    { text: 'Features (/features): Domain-driven folders (auth, job-seeker, recruiter).', options: { breakLine: true } },
    { text: 'State Handling: RxJS Observables and manual Change Detection via ChangeDetectorRef.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 6: Backend Service Standardization
let slide6 = pres.addSlide();
slide6.addText('Backend Service Standardization', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide6.addText([
    { text: 'Each of the 6 core business microservices strictly adheres to a layered architecture:', options: { breakLine: true, bold: true } },
    { text: 'controllers/: REST endpoints mapped to HTTP verbs.', options: { breakLine: true } },
    { text: 'services/: Business logic implementations (@Transactional).', options: { breakLine: true } },
    { text: 'repositories/: Spring Data JPA interfaces.', options: { breakLine: true } },
    { text: 'models/: JPA Entities (@Entity).', options: { breakLine: true } },
    { text: 'dto/: Request/Response objects for payload abstraction.', options: { breakLine: true } },
    { text: 'config/: Security, RabbitMQ, and Redis configurations.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 7: Authentication & Security
let slide7 = pres.addSlide();
slide7.addText('Stateless JWT Authentication Flow', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide7.addText([
    { text: 'Generation: user-service validates BCrypt hash and issues an HMAC-SHA256 JWT containing email and role claims.', options: { breakLine: true } },
    { text: 'Transmission: Frontend stores token in localStorage; AuthInterceptor attaches it as a Bearer token.', options: { breakLine: true } },
    { text: 'Validation: api-gateway executes JwtAuthFilter. Validates token natively, extracts claims, and mutates headers.', options: { breakLine: true } },
    { text: 'Authorization: Downstream services verify ownership (e.g., Job Seeker can only view their own applications).' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 8: Database Design Strategy
let slide8 = pres.addSlide();
slide8.addText('Database-Per-Service Pattern', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide8.addText([
    { text: 'PostgreSQL 15: 6 distinct databases ensuring strict domain isolation.', options: { breakLine: true } },
    { text: 'jobportal_user_db: User credentials and roles.', options: { breakLine: true } },
    { text: 'jobportal_job_db: Job postings with Redis caching.', options: { breakLine: true } },
    { text: 'application_db: Application lifecycle mapping users to jobs via UUIDs.', options: { breakLine: true } },
    { text: 'job_search_db: CQRS read-model optimized for multi-filter searching.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 9: Event-Driven Workflow
let slide9 = pres.addSlide();
slide9.addText('Asynchronous Communication via RabbitMQ', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide9.addText([
    { text: 'Topic Exchange: jobportal.exchange routes messages based on routing keys.', options: { breakLine: true } },
    { text: 'Events Published:', options: { breakLine: true, bold: true } },
    { text: ' - job.created (Handled by Search & Notification)', options: { breakLine: true } },
    { text: ' - job.closed (Updates search index)', options: { breakLine: true } },
    { text: ' - job.applied (Triggers email to recruiter)', options: { breakLine: true } },
    { text: ' - resume.uploaded (Triggers file processing notification)', options: { breakLine: true } },
    { text: 'Benefit: Search and Notification services scale independently of the core job creation flow.', options: { bold: true } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 10: API Design
let slide10 = pres.addSlide();
slide10.addText('RESTful API Abstraction', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide10.addTable([
    [{ text: 'Method', options: { bold: true } }, { text: 'Endpoint', options: { bold: true } }, { text: 'Service', options: { bold: true } }, { text: 'Purpose', options: { bold: true } }],
    ['POST', '/api/users/login', 'User', 'Authenticate & get JWT'],
    ['POST', '/api/jobs', 'Job', 'Recruiter creates a job'],
    ['GET', '/api/applications/me', 'Application', 'Seeker views their history'],
    ['POST', '/api/resumes/upload', 'Resume', 'Upload resume file'],
    ['GET', '/search/jobs', 'Search', 'Multi-filter job querying']
], { x: 0.5, y: 1.5, w: 9.0, colW: [1.0, 3.5, 1.5, 3.0], fill: 'F1F1F1', fontSize: 14, color: '333333', border: { type: 'solid', pt: 1, color: 'CCCCCC' } });

// Slide 11: CQRS Search Implementation
let slide11 = pres.addSlide();
slide11.addText('Real-Time Search & Indexing (CQRS-Lite)', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide11.addText([
    { text: 'Challenge: Complex queries (keyword, location, salary) slow down primary transactional database.', options: { breakLine: true } },
    { text: 'Solution: search-service maintains a read-optimized copy of job data.', options: { breakLine: true } },
    { text: 'Execution: Uses Spring Data derived queries to handle multi-filter logic efficiently without impacting job-service performance.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Slide 12: Conclusion
let slide12 = pres.addSlide();
slide12.addText('Conclusion & Summary', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '003366' });
slide12.addText([
    { text: 'JobCompass successfully demonstrates how microservices solve scalability bottlenecks.', options: { breakLine: true } },
    { text: 'The use of Event-Driven Architecture ensures high decoupling and performance.', options: { breakLine: true } },
    { text: 'Modern frontend practices (Angular Standalone components) provide a responsive, seamless user experience.', options: { breakLine: true } },
    { text: 'The system is fully containerized, CI/CD integrated, and production-ready.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bullet: true, color: '333333' });

// Save
pres.writeFile({ fileName: 'JobCompass_Presentation.pptx' }).then(fileName => {
    console.log(`Created file: ${fileName}`);
}).catch(err => {
    console.error(err);
});
