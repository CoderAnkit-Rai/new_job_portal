# JobCompass — Complete Codebase Analysis

## 1. Architecture Overview

**Project**: JobCompass — A microservices-based Job Portal Management System  
**Organization**: `com.capg` (Capgemini)  
**Tech Stack**:
- **Backend**: Spring Boot 3.x, Java 17, Spring Cloud (Eureka, Config Server, Gateway)
- **Frontend**: Angular 21, TailwindCSS 4, Lucide Icons, Chart.js
- **Databases**: PostgreSQL 15 (6 separate databases, one per service)
- **Messaging**: RabbitMQ 3 (Topic Exchange, durable queues)
- **Caching**: Redis 7 (job-service only, 10-min TTL)
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (SonarCloud)
- **API Docs**: SpringDoc OpenAPI / Swagger UI (aggregated at gateway)
- **Deployment**: Vercel (frontend), Docker Compose (backend), ngrok (tunneling)

### System Topology

```
┌──────────┐      ┌──────────────┐      ┌─────────────────────────────────────┐
│ Angular  │─────▶│ API Gateway  │─────▶│  Microservices (6 business + 2 infra)│
│ Frontend │ HTTP │  :8080       │      │                                     │
│ (Vercel) │      │ JWT Filter   │      │  user-service      :8081            │
└──────────┘      │ CORS Config  │      │  job-service       :8082            │
                  │ Route Config │      │  application-svc   :8083            │
                  └──────────────┘      │  resume-service    :8084            │
                         │              │  notification-svc  :8085            │
                  ┌──────┴──────┐       │  search-service    :8086            │
                  │ Eureka :8761│       └─────────────────────────────────────┘
                  │ Config :8888│                    │
                  └─────────────┘       ┌───────────┴────────────┐
                                        │  RabbitMQ    :5672     │
                                        │  PostgreSQL  :5432     │
                                        │  Redis       :6379     │
                                        └────────────────────────┘
```

### Database-per-Service Strategy

| Service | Database | ID Type |
|---------|----------|---------|
| user-service | `jobportal_user_db` | Long (IDENTITY) |
| job-service | `jobportal_job_db` | Long (IDENTITY) |
| application-service | `application_db` | UUID (auto) |
| resume-service | `jobportal_resume` | Long (IDENTITY) |
| search-service | `job_search_db` | Long (assigned from event) |
| analytics-service | `analytics_db` | (referenced in init-db.sql) |

---

## 2. Application Flow Tree

### Authentication Flow
```
User → POST /api/users/register → UserService → BCrypt hash → DB → UserResponse
User → POST /api/users/login → UserService → BCrypt verify → JwtUtil.generateToken(email, role) → {token}
Frontend → stores token in localStorage → AuthInterceptor adds Bearer header
API Gateway JwtAuthFilter → validates JWT → extracts email+role → adds X-User-Email, X-User-Role headers → forwards
```

### Job Seeker Flow
```
Login → redirectByRole() → /jobs (RecommendedJobsComponent)
  ├── Browse open jobs (via search-service /search/all/jobs)
  ├── /jobs/search → SearchJobsComponent → filters (keyword, location, salary, type, experience)
  ├── /jobs/:id → JobDetailComponent → view details + apply
  ├── Apply → POST /api/applications → ApplicationService → RabbitMQ event (job.applied)
  ├── /applications → MyApplicationsComponent → track status (APPLIED→SHORTLISTED→INTERVIEW→REJECTED)
  │   └── Withdraw (DELETE /api/applications/:id) — only if status=APPLIED
  ├── /resume → ResumeProfileComponent → upload file (multipart) or URL → RabbitMQ event (resume.uploaded)
  ├── /profile → MyProfileComponent → edit name, mobile, skills, headline
  └── /change-password → ChangePasswordComponent
```

### Recruiter Flow
```
Login → redirectByRole() → /recruiter/dashboard (DashboardComponent)
  ├── Dashboard stats: open roles, total applicants, shortlisted, interviews
  ├── /recruiter/post-job → PostJobComponent → POST /api/jobs (+ edit via ?edit=jobId)
  │   └── Creates job → RabbitMQ events: job.created → search-service + notification-service
  ├── /recruiter/my-jobs → MyJobsComponent → list own jobs, close jobs
  │   └── Close job → PUT /api/jobs/:id/close → RabbitMQ event (job.closed)
  ├── /recruiter/applicants/:jobId → ApplicantsComponent → view/filter/update status
  │   ├── Slide-over panel: profile, skills, resumes, status update
  │   └── GET /api/users/by-email, GET /api/resumes/user/:email
  └── /recruiter/profile → RecruiterProfileComponent
```

### Event-Driven Flow (RabbitMQ)
```
Exchange: jobportal.exchange (Topic)

job.created  → job.created.notify.queue  → NotificationConsumer.handleJobCreated()
             → job.created.search.queue  → JobConsumer.handleJobCreated() → indexes in search DB

job.closed   → job.closed.notify.queue   → NotificationConsumer.handleJobClosed()
             → (search-service also listens) → marks job CLOSED in search index

job.applied  → job.applied.notify.queue  → NotificationConsumer.handleJobApplied()

resume.uploaded → resume.upload.notify.queue → NotificationConsumer.handleResumeUploaded()
```

---

## 3. Major Modules List

### Backend Services (8 total)

| # | Service | Port | Purpose | DB | MQ |
|---|---------|------|---------|----|----|
| 1 | **eureka-server** | 8761 | Service discovery | — | — |
| 2 | **config-server** | 8888 | Centralized config (Git-backed) | — | — |
| 3 | **api-gateway** | 8080 | Routing, JWT auth, CORS, RBAC | — | — |
| 4 | **user-service** | 8081 | Auth, registration, profile CRUD | ✅ | — |
| 5 | **job-service** | 8082 | Job CRUD, publish events | ✅ | Producer |
| 6 | **application-service** | 8083 | Apply, status management, withdraw | ✅ | Producer |
| 7 | **resume-service** | 8084 | Upload (file+URL), download, delete | ✅ | Producer |
| 8 | **notification-service** | 8085 | Email sending, event consumption | — | Consumer |
| 9 | **search-service** | 8086 | Job indexing, multi-filter search | ✅ | Consumer |

### Frontend Modules

| Module | Components | Services |
|--------|-----------|----------|
| **core** | — | AuthService, ThemeService |
| **core/guards** | authGuard, roleGuard | — |
| **core/interceptors** | authInterceptor | — |
| **features/auth** | LoginComponent, RegisterComponent, ChangePasswordComponent | AuthApiService |
| **features/job-seeker** | RecommendedJobs, SearchJobs, JobDetail, MyApplications, MyProfile, ResumeProfile | JobService, ApplicationService, ResumeService |
| **features/recruiter** | Dashboard, PostJob, MyJobs, Applicants, RecruiterProfile | RecruiterJobService, ApplicantService |
| **features/landing** | LandingComponent | — |
| **features/legal** | LegalComponent (data-driven: about, careers, privacy, terms, help) | — |
| **shared** | NavbarComponent, FooterComponent, ConfirmModalComponent | — |

---

## 4. Important Files List

### Backend — Critical Files

| File | Significance |
|------|-------------|
| `api-gateway/.../JwtAuthFilter.java` | **Central RBAC engine** — 208 lines, all role-based access rules |
| `api-gateway/.../GatewayRoutesConfig.java` | Route definitions for all services |
| `api-gateway/.../CorsConfig.java` | CORS policy for frontend |
| `api-gateway/.../JwtUtil.java` | Gateway-side JWT validation (no generation) |
| `user-service/.../UserServiceImpl.java` | Registration, login, profile — core auth logic |
| `user-service/.../JwtUtil.java` | JWT generation + validation (HMAC-SHA256) |
| `user-service/.../SecurityConfig.java` | Spring Security disabled (stateless JWT) |
| `job-service/.../JobServiceImpl.java` | Job CRUD + RabbitMQ publishing |
| `job-service/.../RabbitMQConfig.java` | Exchange, queues, bindings for job events |
| `job-service/.../RedisConfig.java` | Redis cache manager with JSON serialization |
| `application-service/.../ApplicationServiceImpl.java` | Apply, withdraw, status management |
| `application-service/.../JobClient.java` | Feign client for inter-service calls |
| `resume-service/.../ResumeServiceImpl.java` | File upload with path traversal protection |
| `notification-service/.../NotificationConsumer.java` | 4 RabbitMQ listeners |
| `notification-service/.../EmailService.java` | Gmail SMTP integration |
| `search-service/.../JobConsumer.java` | Event-driven job indexing |
| `search-service/.../JobSearchService.java` | Multi-filter search logic |
| `docker-compose.yml` | Full infrastructure orchestration (331 lines) |
| `jobportal-config/` | 27 externalized config files |

### Frontend — Critical Files

| File | Significance |
|------|-------------|
| `app.routes.ts` | All route definitions with lazy loading + guards |
| `app.config.ts` | Provider setup (router, HTTP client, interceptors) |
| `core/services/auth.service.ts` | Token management, role extraction, JWT decode |
| `core/guards/auth.guard.ts` | Authentication guard (functional) |
| `core/guards/role.guard.ts` | Role-based guard (factory function) |
| `core/interceptors/auth.interceptor.ts` | Bearer token injection + ngrok header |
| `environments/environment.ts` | API base URL (`localhost:8080`) |
| `environments/environment.prod.ts` | Production API URL (ngrok) |

---

## 5. Chapter Plan — 200+ Page Technical Book

### Part I: Foundation & Architecture (Chapters 1–4, ~50 pages)

**Chapter 1: Introduction to JobCompass** (~12 pages)
- 1.1 Project overview and business requirements
- 1.2 Technology stack justification
- 1.3 System actors: Job Seeker, Recruiter, Admin
- 1.4 Feature matrix per role
- 1.5 Development environment setup

**Chapter 2: Microservices Architecture** (~15 pages)
- 2.1 Monolith vs microservices — why microservices for JobCompass
- 2.2 Service decomposition strategy (bounded contexts)
- 2.3 Database-per-service pattern
- 2.4 Inter-service communication patterns (sync REST + async MQ)
- 2.5 System topology diagram
- 2.6 Port allocation and service registry

**Chapter 3: Infrastructure Services** (~12 pages)
- 3.1 Eureka Server — service discovery deep dive
- 3.2 Config Server — externalized configuration with Git backend
- 3.3 Configuration profiles (default, dev, prod, docker)
- 3.4 Environment-specific properties walkthrough

**Chapter 4: API Gateway** (~12 pages)
- 4.1 Spring Cloud Gateway architecture (reactive stack)
- 4.2 Route configuration (programmatic + properties)
- 4.3 JwtAuthFilter — the RBAC engine (line-by-line)
- 4.4 CORS configuration strategy
- 4.5 Swagger UI aggregation across services
- 4.6 Header propagation (X-User-Email, X-User-Role)

---

### Part II: Backend Services Deep Dive (Chapters 5–10, ~70 pages)

**Chapter 5: User Service — Authentication & Identity** (~15 pages)
- 5.1 User entity design (roles, profile fields)
- 5.2 Registration flow with validation
- 5.3 Login flow and JWT generation
- 5.4 JWT structure (claims: sub=email, role)
- 5.5 Password hashing with BCrypt
- 5.6 Profile management (update, get by ID/email)
- 5.7 Ownership-based authorization in service layer
- 5.8 SecurityConfig — why permitAll() works here
- 5.9 MapStruct mapper pattern
- 5.10 Exception handling strategy

**Chapter 6: Job Service — Core Business Logic** (~12 pages)
- 6.1 Job entity and lifecycle (OPEN → CLOSED)
- 6.2 Creating jobs — recruiter-only authorization
- 6.3 Updating and closing jobs
- 6.4 Pagination with Spring Data
- 6.5 Redis caching (@Cacheable) with TTL
- 6.6 RabbitMQ event publishing (job.created, job.closed)
- 6.7 Recruiter-scoped queries (findByCreatedBy)

**Chapter 7: Application Service — Job Application Lifecycle** (~12 pages)
- 7.1 Application entity (UUID PK, status enum)
- 7.2 Apply flow — duplicate prevention, role check
- 7.3 Status state machine (APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → REJECTED)
- 7.4 Withdraw logic — only APPLIED can be withdrawn
- 7.5 Feign client for inter-service calls (JobClient)
- 7.6 Circuit breaker with FallbackFactory
- 7.7 RabbitMQ event publishing (job.applied)

**Chapter 8: Resume Service — File Management** (~10 pages)
- 8.1 Resume entity design
- 8.2 URL-based upload vs multipart file upload
- 8.3 File storage strategy (local filesystem)
- 8.4 Path traversal prevention and filename sanitization
- 8.5 File download endpoint with content type detection
- 8.6 Role-based access (seeker=own, recruiter=any)
- 8.7 RabbitMQ event publishing (resume.uploaded)

**Chapter 9: Search Service — Event-Driven Indexing** (~10 pages)
- 9.1 CQRS-lite pattern: separate read model
- 9.2 JobConsumer — indexing from RabbitMQ events
- 9.3 Multi-filter search (keyword, location, company, salary range)
- 9.4 Spring Data derived query methods
- 9.5 Search entity vs Job entity differences

**Chapter 10: Notification Service — Event Consumers** (~10 pages)
- 10.1 Consumer architecture (4 listeners)
- 10.2 RabbitMQ listener configuration
- 10.3 EmailService — Gmail SMTP integration
- 10.4 Error handling — credential failures vs transient errors
- 10.5 Queue bindings and routing key patterns

---

### Part III: Frontend Deep Dive (Chapters 11–17, ~60 pages)

**Chapter 11: Angular Architecture & Project Setup** (~10 pages)
- 11.1 Angular 21 standalone components (no NgModules)
- 11.2 Project structure (core, features, shared, environments)
- 11.3 App configuration (providers, interceptors)
- 11.4 TailwindCSS 4 integration
- 11.5 Lucide Angular icons

**Chapter 12: Authentication & Authorization in Angular** (~10 pages)
- 12.1 AuthService — token storage, JWT decoding, role extraction
- 12.2 AuthApiService — login/register HTTP calls
- 12.3 authGuard — functional CanActivateFn
- 12.4 roleGuard — factory function pattern with allowed roles
- 12.5 authInterceptor — Bearer token + ngrok header injection
- 12.6 Role-based redirects (redirectByRole)

**Chapter 13: Routing & Lazy Loading** (~8 pages)
- 13.1 Route configuration with loadComponent()
- 13.2 Guard composition (authGuard + roleGuard)
- 13.3 Route data for parameterized components (LegalComponent)
- 13.4 Wildcard redirect strategy
- 13.5 Query parameter navigation patterns

**Chapter 14: Job Seeker Features** (~12 pages)
- 14.1 RecommendedJobsComponent — landing page for seekers
- 14.2 SearchJobsComponent — sidebar filters, client-side sort/paginate
- 14.3 JobDetailComponent — view + apply
- 14.4 MyApplicationsComponent — status tracking, job detail enrichment (forkJoin)
- 14.5 ResumeProfileComponent — file upload, version history
- 14.6 MyProfileComponent — profile editing

**Chapter 15: Recruiter Features** (~10 pages)
- 15.1 DashboardComponent — stats aggregation, recent jobs table
- 15.2 PostJobComponent — create + edit (query param mode)
- 15.3 MyJobsComponent — list, close jobs
- 15.4 ApplicantsComponent — slide-over panel, profile/resume fetch, status update

**Chapter 16: Shared Components** (~5 pages)
- 16.1 NavbarComponent — role-aware navigation, dark mode, search bar
- 16.2 FooterComponent — legal links
- 16.3 ConfirmModalComponent — reusable modal with @Input/@Output
- 16.4 LandingComponent — marketing page

**Chapter 17: API Communication Patterns** (~5 pages)
- 17.1 Service-per-feature pattern (JobService, ApplicationService, etc.)
- 17.2 Environment-based API URL
- 17.3 HttpParams for query parameters
- 17.4 Observable subscription patterns
- 17.5 ChangeDetectorRef usage for manual change detection

---

### Part IV: Infrastructure & DevOps (Chapters 18–21, ~30 pages)

**Chapter 18: Docker & Containerization** (~8 pages)
- 18.1 Multi-stage Dockerfile pattern (build + runtime)
- 18.2 Docker Compose orchestration (13 services)
- 18.3 Health checks and dependency ordering
- 18.4 Volume management (postgres_data, resume_uploads)
- 18.5 Network configuration

**Chapter 19: Event-Driven Architecture with RabbitMQ** (~10 pages)
- 19.1 Topic exchange design
- 19.2 Queue naming conventions
- 19.3 Binding patterns (routing keys)
- 19.4 Jackson2JsonMessageConverter
- 19.5 Event DTO design across services
- 19.6 Error handling in publishers/consumers

**Chapter 20: Caching with Redis** (~5 pages)
- 20.1 RedisCacheManager configuration
- 20.2 @Cacheable annotation usage
- 20.3 JSON serialization with JavaTimeModule
- 20.4 TTL strategy

**Chapter 21: CI/CD & Quality** (~7 pages)
- 21.1 GitHub Actions workflow (SonarCloud)
- 21.2 SonarQube configuration and exclusions
- 21.3 Test coverage strategy
- 21.4 Unit testing patterns (controller, service, config tests)

---

### Part V: Cross-Cutting Concerns (Chapters 22–24, ~20 pages)

**Chapter 22: Security Architecture** (~8 pages)
- 22.1 JWT lifecycle: generation → transmission → validation → extraction
- 22.2 Dual JwtUtil pattern (user-service generates, gateway validates)
- 22.3 Gateway-level RBAC matrix (full endpoint table)
- 22.4 Service-level ownership checks
- 22.5 CSRF disabled by design
- 22.6 Password security (BCrypt)

**Chapter 23: Error Handling & Validation** (~6 pages)
- 23.1 GlobalExceptionHandler pattern (per service)
- 23.2 ErrorResponse DTO structure
- 23.3 Custom exceptions hierarchy
- 23.4 Jakarta Bean Validation (@NotBlank, @Email, @Size)
- 23.5 HTTP status code mapping

**Chapter 24: Logging & Observability** (~6 pages)
- 24.1 SLF4J/Logback configuration
- 24.2 Structured logging patterns
- 24.3 logback-spring.xml per service
- 24.4 Zipkin tracing configuration (in properties)

---

## 6. Documentation Strategy

### Approach: Bottom-Up with Pattern Deduplication

1. **Document patterns once, reference everywhere** — e.g., the Service-Repository-Controller pattern is identical across all services; document it once with one service, then reference.

2. **Layer-based documentation order**:
   - Infrastructure first (Docker, Eureka, Config)
   - Gateway + Security second
   - Backend services third (user → job → application → resume → search → notification)
   - Frontend last

3. **Each backend service chapter follows the same structure**:
   - Entity → Repository → Service Interface → ServiceImpl → Controller → DTOs → Mapper → Exceptions → Config → Tests

4. **Diagrams for every major flow**: sequence diagrams for auth, job creation, application lifecycle, event propagation.

5. **Code listings**: Full source code with line-by-line annotations for critical files (JwtAuthFilter, UserServiceImpl, ApplicationServiceImpl).

6. **Cross-reference tables**: API endpoint table, RabbitMQ event table, database schema table.

---

## 7. Reusable Patterns (Document Once)

### Pattern 1: Service Layer Architecture
Every backend service follows: `Entity → Repository (JpaRepository) → Service Interface → ServiceImpl (@Service, @Transactional) → Controller (@RestController) → DTOs (Request/Response) → Mapper (MapStruct @Mapper)`  
*Used in*: user, job, application, resume, search

### Pattern 2: GlobalExceptionHandler
`@RestControllerAdvice` with `@ExceptionHandler` methods returning `ErrorResponse(timestamp, status, error, message)`.  
*Used in*: user, job, application, resume, search

### Pattern 3: RabbitMQ Configuration
`TopicExchange("jobportal.exchange") + durable Queues + Bindings + Jackson2JsonMessageConverter`.  
*Used in*: job, application, resume, notification, search

### Pattern 4: RabbitMQ Event Publishing
`try { rabbitTemplate.convertAndSend(exchange, routingKey, event); } catch (Exception e) { log.error(...); }` — fire-and-forget with error logging.  
*Used in*: job-service, application-service, resume-service

### Pattern 5: Header-Based Authorization
Controllers receive `@RequestHeader("X-User-Email")` and `@RequestHeader("X-User-Role")` injected by the gateway after JWT validation.  
*Used in*: Every protected controller endpoint

### Pattern 6: Ownership Check Pattern
```java
if (!entity.getOwnerEmail().equals(email) && !role.equals("ADMIN")) {
    throw new UnauthorizedException("You can only access your own resources");
}
```
*Used in*: user-service, resume-service, application-service

### Pattern 7: Angular Standalone Component Pattern
Every component is `standalone: true`, uses `imports: [CommonModule, ...]`, has inline or file template, and uses `ChangeDetectorRef` for manual change detection.  
*Used in*: All 15+ frontend components

### Pattern 8: Frontend Service Pattern
`@Injectable({ providedIn: 'root' })` with `private base = environment.apiUrl` and `HttpClient` for API calls returning `Observable<any>`.  
*Used in*: All 7 frontend services

### Pattern 9: Pagination Pattern
Backend: Spring Data `Page<T>` with `PageRequest.of(page, size)`.  
Frontend: Client-side `currentPage, totalPages, pageSize, goToPage(), getPages()`.  
*Used in*: jobs, applications, applicants, search

### Pattern 10: Multi-stage Dockerfile
```dockerfile
FROM amazoncorretto:17 AS build → mvnw package
FROM amazoncorretto:17 → COPY jar → ENTRYPOINT
```
*Used in*: All 8 backend services

### Pattern 11: Status Badge UI Pattern
```typescript
getStatusClass(status) → map of status → tailwind classes
getStatusLabel(status) → map of status → display labels
```
*Used in*: MyApplicationsComponent, ApplicantsComponent, SearchJobsComponent

---

## 8. Detected Architecture Patterns Summary

| Pattern | Where |
|---------|-------|
| **Microservices** | 6 business + 2 infra services |
| **API Gateway** | Spring Cloud Gateway (reactive) |
| **Service Discovery** | Netflix Eureka |
| **Externalized Config** | Spring Cloud Config Server (Git) |
| **Database per Service** | 6 PostgreSQL databases |
| **CQRS-lite** | search-service maintains read-optimized copy |
| **Event-Driven** | RabbitMQ topic exchange, 4 event types |
| **JWT Stateless Auth** | Generated in user-service, validated in gateway |
| **RBAC** | Gateway-level + service-level ownership checks |
| **Circuit Breaker** | Feign + FallbackFactory in application-service |
| **Caching** | Redis in job-service (@Cacheable) |
| **DTO Pattern** | Request/Response DTOs, MapStruct mappers |
| **Standalone Components** | Angular 21, no NgModules |
| **Functional Guards** | CanActivateFn, factory function for role guard |
| **Lazy Loading** | loadComponent() for all routes |
| **Interceptor Pattern** | HTTP interceptor for auth headers |

---

## 9. API Endpoint Summary

| Method | Path | Service | Auth | Role |
|--------|------|---------|------|------|
| POST | `/api/users/register` | user | Public | — |
| POST | `/api/users/login` | user | Public | — |
| GET | `/api/users/me` | user | ✅ | Any |
| GET | `/api/users/{id}` | user | ✅ | Any (ownership) |
| PUT | `/api/users/{id}` | user | ✅ | Any (ownership) |
| GET | `/api/users/by-email/{email}` | user | ✅ | RECRUITER, ADMIN |
| POST | `/api/jobs` | job | ✅ | RECRUITER |
| GET | `/api/jobs` | job | ✅ | Any |
| GET | `/api/jobs/{id}` | job | ✅ | Any |
| PUT | `/api/jobs/{id}` | job | ✅ | RECRUITER |
| PUT | `/api/jobs/{id}/close` | job | ✅ | RECRUITER |
| POST | `/api/applications` | application | ✅ | JOB_SEEKER |
| GET | `/api/applications/me` | application | ✅ | JOB_SEEKER |
| GET | `/api/applications/job/{id}` | application | ✅ | RECRUITER |
| PUT | `/api/applications/{id}/status` | application | ✅ | RECRUITER |
| DELETE | `/api/applications/{id}` | application | ✅ | JOB_SEEKER |
| POST | `/api/resumes` | resume | ✅ | JOB_SEEKER |
| POST | `/api/resumes/upload` | resume | ✅ | JOB_SEEKER |
| GET | `/api/resumes/me` | resume | ✅ | JOB_SEEKER |
| GET | `/api/resumes/{id}` | resume | ✅ | Any |
| GET | `/api/resumes/user/{email}` | resume | ✅ | RECRUITER, ADMIN |
| GET | `/api/resumes/download/{file}` | resume | Public | — |
| DELETE | `/api/resumes/{id}` | resume | ✅ | JOB_SEEKER |
| GET | `/search/all/jobs` | search | ✅ | Any |
| GET | `/search/jobs` | search | ✅ | Any |
| GET | `/search/jobs/{id}` | search | ✅ | Any |

---

> [!IMPORTANT]
> This analysis is complete. I have NOT started writing the book yet. Awaiting your approval to proceed.
