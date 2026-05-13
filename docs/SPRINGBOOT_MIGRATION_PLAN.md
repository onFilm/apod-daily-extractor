# Comprehensive Plan: APOD Spring Boot Migration & Local AI Agent

This document outlines an in-depth, step-by-step plan to migrate the APOD application to a **Spring Boot Backend**, create a fully local **AI Agent**, connect it to your **`apod-view` frontend**, and automate data collection via **GitHub Actions using Python**.

---

## 1. Frontend User Stories

To guide the development of both the frontend and backend, we will follow these user stories:

### Core Browsing
- **US1**: As a user, I want to browse a paginated gallery of past APOD images using a fast REST API so that I can quickly explore the cosmos.
- **US2**: As a user, I want to click on a specific APOD thumbnail to navigate to a detailed view showing the high-resolution image, title, date, and explanation.
- **US3**: As a mobile user on a slow connection, I want the app to use GraphQL to fetch only the image thumbnails and titles without downloading massive text payloads, saving my bandwidth.

### Real-Time Features
- **US4**: As a user with the app open, I want to receive a real-time notification via WebSocket the exact moment a new daily APOD is added to the system.
- **US5**: As a user reading an APOD explanation, I want to chat with an "AI Astronomer" using a sliding chat panel, where responses stream character-by-character (SSE) so I don't have to wait for the entire response to load.

### Security
- **US6**: As an administrator, I want to log in using my credentials and receive a JWT token, so that I can access restricted admin features (like triggering a manual data sync).

---

## 2. API Use Cases & Capabilities

Spring Boot allows us to build multiple types of APIs tailored to specific needs:

### A. REST APIs
- **Use Case**: Standard data fetching for the main gallery view.
- **Why**: REST is the industry standard. It's easily cacheable by browsers and CDNs, making it perfect for fetching the latest 20 APODs or retrieving a single APOD by its date.

### B. GraphQL APIs
- **Use Case**: Flexible data fetching for specialized views (e.g., a "Title Only" sidebar or mobile-optimized views).
- **Why**: Prevents "Overfetching". If the UI only needs the `url` and `date` to render a grid, GraphQL allows the client to request *exactly* those fields, entirely ignoring the long `explanation` text.

### C. WebSocket API (Bi-Directional)
- **Use Case**: Instant UI notifications and collaborative features.
- **Why**: Unlike REST (which requires the frontend to constantly poll the server), WebSockets keep an open connection. The server can push a "NEW_APOD_AVAILABLE" event to all connected users instantly.

### D. Server-Sent Events (SSE) / WebFlux Streaming
- **Use Case**: AI Agent response streaming.
- **Why**: LLMs take time to generate full paragraphs. Instead of waiting 10 seconds for the backend to return a full JSON response, SSE pushes characters to the frontend as soon as the LLM generates them, creating a real-time typing effect.

---

## 3. Phase-by-Phase Implementation Guide

### Phase 1: Automated Data Collection (Python + GitHub Actions)
*Goal: Automatically fetch and store daily NASA APOD data.*

**In-Depth Substeps**:
1. **Initialize Extractor**: Create `src/extractor.py`. Import `requests` and `json`.
2. **Fetch NASA Data**: Make a GET request to `https://api.nasa.gov/planetary/apod?api_key=YOUR_API_KEY`. Parse the JSON response.
3. **Local JSON Merging**: 
   - Open the local `extracted_data.json`.
   - Check if today's date already exists in the JSON array to prevent duplication.
   - If missing, append the new APOD object.
4. **GitHub Actions Configuration**:
   - Create `.github/workflows/daily-extraction.yml`.
   - Add a `schedule` trigger (e.g., `cron: '0 5 * * *'` to run at 5 AM daily).
   - Add jobs to checkout the code, install Python, run the script, and run `git config` commands to commit and push the updated `extracted_data.json` automatically using `secrets.GITHUB_TOKEN`.

### Phase 2: Spring Boot Foundation & Database
*Goal: Scaffold the backend to ingest the local data on startup.*

**In-Depth Substeps**:
1. **Project Scaffold**: Use Spring Initializr to generate a Maven project with Spring Web, Data JPA, H2 Database, Lombok, and Jackson.
2. **Database Configuration**: In `application.yml`, configure the H2 in-memory database URL, username, and enable the H2 web console for debugging.
3. **Entity Creation**: Create a `@Entity` class `ApodEntry` with fields: `id` (Primary Key), `date`, `title`, `url`, `hdurl`, `mediaType`, `explanation`.
4. **Repository Setup**: Create `ApodRepository` interface extending `JpaRepository<ApodEntry, Long>`.
5. **Startup Ingestion Logic**:
   - Create a class `DataIngestionRunner` implementing `CommandLineRunner`.
   - Read the local `extracted_data.json` file (pulled from GitHub) using `ObjectMapper.readValue()`.
   - Iterate through the JSON list, map them to `ApodEntry` entities, and call `apodRepository.saveAll()`. This seeds your database instantly on every boot.

### Phase 3: Building the API Layers
*Goal: Serve the data through multiple architectural styles.*

**In-Depth Substeps**:
1. **REST Controller**:
   - Create `ApodRestController`.
   - Map `@GetMapping("/api/v1/apods")` to return `Page<ApodEntry>` using Spring Data `Pageable` for pagination.
   - Map `@GetMapping("/api/v1/apods/{date}")` to fetch an APOD by its specific date string.
2. **GraphQL Setup**:
   - Add `spring-boot-starter-graphql`.
   - Create `src/main/resources/graphql/schema.graphqls` defining types for `Apod` and a `Query` for `getApods(limit: Int)`.
   - Create `ApodGraphqlController` using `@QueryMapping` to route GraphQL queries to the `ApodRepository`.
3. **WebSocket Configuration**:
   - Add `spring-boot-starter-websocket`.
   - Create a class extending `TextWebSocketHandler` and override `handleTextMessage()`.
   - Register it in a class implementing `WebSocketConfigurer` under the endpoint `/ws/notifications`.
   - Implement a Spring `@Scheduled` task that mimics a new APOD discovery and broadcasts a JSON payload to all active `WebSocketSession`s.

### Phase 4: Local AI Agent & Streaming
*Goal: RAG-powered chatbot acting as an Astronomer.*

**In-Depth Substeps**:
1. **Local LLM Setup**: Install Ollama. Run `ollama pull llama3` in your terminal.
2. **Spring AI Configuration**: Add `spring-ai-ollama-spring-boot-starter`. Set `spring.ai.ollama.chat.model=llama3` in `application.yml`.
3. **Vector Database & Embeddings**:
   - Create a `SimpleVectorStore` bean (in-memory).
   - During the `CommandLineRunner` startup sequence (from Phase 2), take the `explanation` text of each APOD, convert it to a `Document`, and call `vectorStore.add(documents)`.
4. **RAG Controller**:
   - Create `AgentController`.
   - Implement `@GetMapping("/api/v1/agent/chat")` that accepts a `prompt`.
   - Search the `vectorStore` for documents matching the user's prompt.
   - Construct a `SystemPromptTemplate`: "You are an astronomer. Answer the user based on this context: {context}".
   - Return a `Flux<String>` by calling `chatClient.prompt(prompt).stream().content()`, ensuring the `@GetMapping` produces `MediaType.TEXT_EVENT_STREAM_VALUE`.

### Phase 5: Security & Authentication
*Goal: Secure your backend.*

**In-Depth Substeps**:
1. **Spring Security Scaffold**: Add `spring-boot-starter-security` and `jjwt-api`.
2. **Security Config**: Create `SecurityConfig` class. Define a `SecurityFilterChain` bean disabling CSRF (since we use tokens) and setting session creation policy to `STATELESS`.
3. **Login Implementation**:
   - Create a `POST /api/auth/login` endpoint that accepts username/password.
   - Authenticate against an in-memory user or local DB user.
   - Generate a signed JWT token containing the user's role and expiration time.
4. **JWT Filter**:
   - Create `JwtAuthenticationFilter` extending `OncePerRequestFilter`.
   - Extract the token from the `Authorization: Bearer <token>` header, validate its signature, and populate `SecurityContextHolder`.

### Phase 6: Frontend Integration (apod-view)
*Goal: Connect the UI to the local Spring Boot backend.*

**In-Depth Substeps**:
1. **REST Integration**: Use `axios` or standard `fetch` in your React/Vue components to load the main gallery from `http://localhost:8080/api/v1/apods`. Implement infinite scrolling using the pagination data.
2. **GraphQL Client**: Install `@apollo/client`. Write a query to fetch ONLY `{ title, url }` for a lightweight sidebar showing "On This Day" historical APODs.
3. **WebSocket Client**: Create a global WebSocket connection using the native `WebSocket` API. Listen for `onmessage` events and display a toast notification when the server broadcasts a "NEW_APOD" event.
4. **Agent Chat UI**: 
   - Build a chat interface. 
   - Instead of standard fetch, use `new EventSource("http://localhost:8080/api/v1/agent/chat?prompt=...")`. 
   - Append data chunks to the current chat message state as they trigger the `onmessage` event, achieving the typing effect.

---

## Local Development Workflow

1. **Background**: Ollama is running locally (`ollama serve`). GitHub Actions updates `extracted_data.json` daily in the cloud repo.
2. **Sync**: You `git pull` locally.
3. **Backend Boot**: Start Spring Boot. It reads `extracted_data.json`, populates the DB, embeds text into the Vector Store, and exposes REST/GraphQL/WebSocket/SSE endpoints.
4. **Frontend Run**: You start `apod-view` and it seamlessly connects to the rich backend ecosystem.
