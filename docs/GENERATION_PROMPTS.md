# AI Generation Prompts: APOD Spring Boot Migration (Sub-step Granularity)

This file breaks down the project generation into extremely granular prompts, matching every single sub-step from the `SPRINGBOOT_MIGRATION_PLAN.md`. Copy and paste these sequentially into your AI assistant.

---

## Phase 1: Automated Data Collection (Python + GitHub Actions)

### Prompt 1.1: Initialize Extractor
```text
I am starting a new Python project to extract NASA APOD data. Please create a file named `src/extractor.py`. For now, just add the necessary imports (`requests` and `json`) and create a basic main execution block (`if __name__ == '__main__':`) that prints "Starting extraction...".
```

### Prompt 1.2: Fetch NASA Data
```text
Update the `src/extractor.py` script. Inside the main block, use the `requests` library to make a GET request to `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`. Parse the response as JSON and assign it to a variable named `today_apod`. Print the title of the APOD to the console.
```

### Prompt 1.3: Local JSON Merging
```text
Update the `src/extractor.py` script again. Add logic to:
1. Open a local file named `extracted_data.json` and load its contents into a list. (If the file doesn't exist, start with an empty list).
2. Check if the `date` from `today_apod` already exists in the list to prevent duplicates.
3. If it does not exist, append `today_apod` to the list.
4. Write the updated list back to `extracted_data.json` with pretty-print formatting.
```

### Prompt 1.4: GitHub Actions Configuration
```text
I need to automate this script using GitHub Actions. Please write a workflow file at `.github/workflows/daily-extraction.yml`. 
The workflow should trigger on a `schedule` (cron at 5 AM daily). It needs steps to: checkout the code, setup Python, run `pip install requests`, run `python src/extractor.py`, and finally run git commands to commit and push the updated `extracted_data.json` using the GitHub Actions bot.
```

---

## Phase 2: Spring Boot Foundation & Database

### Prompt 2.1: Project Scaffold
```text
I am creating a new Spring Boot (Java) backend. Please list the exact Maven `<dependency>` blocks I need to add to my `pom.xml` for:
1. Spring Web
2. Spring Data JPA
3. H2 Database
4. Lombok
5. Jackson (fasterxml)
```

### Prompt 2.2: Database Configuration
```text
For my Spring Boot application, please provide the `application.yml` file content to configure an H2 in-memory database. Set the URL to `jdbc:h2:mem:apoddb`, set the username to `sa` with an empty password, and enable the H2 web console on path `/h2-console`.
```

### Prompt 2.3: Entity Creation
```text
Please write a JPA `@Entity` class named `ApodEntry` for my Spring Boot application. It should have the following fields:
- `id` (Long, Primary Key, Auto-generated)
- `date` (String)
- `title` (String)
- `url` (String)
- `hdurl` (String)
- `mediaType` (String)
- `explanation` (String, mapped as a large text/CLOB column)
Use Lombok annotations to generate getters, setters, and constructors.
```

### Prompt 2.4: Repository Setup
```text
Please write a Spring Data JPA interface named `ApodRepository`. It should extend `JpaRepository<ApodEntry, Long>`. Also, add a custom query method to find an `ApodEntry` by its `date` string.
```

### Prompt 2.5: Startup Ingestion Logic
```text
Write a class named `DataIngestionRunner` that implements `CommandLineRunner` and is annotated with `@Component`. 
Inject the `ApodRepository` and an `ObjectMapper`. 
In the `run()` method, read the `extracted_data.json` file from the project root, parse it into a `List<ApodEntry>`, and save all entries to the database using the repository. Handle any IOExceptions properly.
```

---

## Phase 3: Building the API Layers

### Prompt 3.1: REST Controller
```text
Create a `@RestController` named `ApodRestController` mapped to `/api/v1/apods`. 
Inject the `ApodRepository` and add two endpoints:
1. `@GetMapping`: Returns a `Page<ApodEntry>` using Spring Data's `Pageable`.
2. `@GetMapping("/{date}")`: Returns a single `ApodEntry` matching the date. Return a 404 response if the date isn't found.
```

### Prompt 3.2: GraphQL Setup
```text
I want to add GraphQL to my Spring Boot app. 
1. Give me the maven dependency for `spring-boot-starter-graphql`.
2. Write a `schema.graphqls` file defining an `Apod` type and a `Query` to `getApods(limit: Int)`.
3. Write an `ApodGraphqlController` with a `@QueryMapping` method that fetches the requested number of APODs from the repository.
```

### Prompt 3.3: WebSocket Configuration
```text
I want to push real-time updates from Spring Boot to the frontend.
1. Give me the maven dependency for `spring-boot-starter-websocket`.
2. Write a `NotificationWebSocketHandler` class that extends `TextWebSocketHandler`. Keep track of connected sessions in a list.
3. Write a `WebSocketConfig` class implementing `WebSocketConfigurer` to register the handler at `/ws/notifications` with `setAllowedOrigins("*")`.
4. Add a `@Scheduled(fixedRate = 60000)` method in a service class that iterates over all open WebSocket sessions and sends a dummy JSON string `{"event": "NEW_APOD"}`.
```

---

## Phase 4: Local AI Agent & Streaming

### Prompt 4.1: Local LLM Setup
```text
I want to run a local LLM using Ollama for my application. Can you provide the terminal commands to install Ollama (on Windows/Mac/Linux) and the command to pull and run the `llama3` model locally?
```

### Prompt 4.2: Spring AI Configuration
```text
I am integrating Spring AI with Ollama.
1. Provide the Maven dependency for `spring-ai-ollama-spring-boot-starter`.
2. Show me the additions to `application.yml` required to configure the Ollama base URL to `http://localhost:11434` and set the chat model to `llama3`.
```

### Prompt 4.3: Vector Database & Embeddings
```text
I need to set up a Vector DB in Spring Boot for RAG (Retrieval-Augmented Generation).
1. Create a Configuration class that exposes a `SimpleVectorStore` `@Bean`. You will need to inject an `EmbeddingModel`.
2. Update my existing `DataIngestionRunner` class: after saving the `ApodEntry` items to the DB, iterate through them, create a Spring AI `Document` containing the `explanation` text as content and the `date` as metadata, and add these documents to the injected `VectorStore`.
```

### Prompt 4.4: RAG Controller
```text
Write a Spring WebFlux controller named `AgentController`.
1. Inject the `ChatClient` and `VectorStore`.
2. Create a `@GetMapping("/api/v1/agent/chat")` endpoint that takes a `prompt` string and returns `Flux<String>`. Ensure the produces type is `MediaType.TEXT_EVENT_STREAM_VALUE`.
3. In the method body, search the `VectorStore` using the `prompt`. Append the search results as context to the user's prompt (e.g., "Answer based on: {context}").
4. Call `chatClient.prompt().stream().content()` with this augmented prompt and return it.
```

---

## Phase 5: Security & Authentication

### Prompt 5.1: Spring Security Scaffold
```text
Provide the Maven dependencies for `spring-boot-starter-security` and `jjwt-api`, `jjwt-impl`, and `jjwt-jackson` (for JSON Web Tokens). 
Then, write a basic `SecurityConfig` class annotated with `@EnableWebSecurity` that defines a `SecurityFilterChain` bean. Disable CSRF and set session management to STATELESS.
```

### Prompt 5.2: Security Config & JWT Util
```text
Write a `JwtUtil` component class for my Spring Boot app. It should contain methods to generate a JWT token given a username, extract the username from a token, and validate the token. Use a hardcoded secret key for now and set an expiration time of 24 hours.
```

### Prompt 5.3: Login Implementation
```text
Create a `@RestController` named `AuthController`. 
Add a `@PostMapping("/api/auth/login")` endpoint that accepts a JSON body with `username` and `password`. 
If the username is "admin" and the password is "password", use the `JwtUtil` to generate a token and return it in a JSON response. Otherwise, throw a RuntimeException or return a 401 status.
```

### Prompt 5.4: JWT Filter
```text
Write a `JwtAuthenticationFilter` that extends `OncePerRequestFilter`. 
In the `doFilterInternal` method, look for the `Authorization` header. If it starts with "Bearer ", extract the token, use `JwtUtil` to validate it and extract the username. If valid, create a `UsernamePasswordAuthenticationToken` and set it in the `SecurityContextHolder`.
Finally, show me how to register this filter before the `UsernamePasswordAuthenticationFilter` in my `SecurityConfig`.
```

---

## Phase 6: Frontend Integration (apod-view)

### Prompt 6.1: REST Integration
```text
In my React/Vue frontend application, write a utility file or component that uses `fetch` (or `axios`) to call my Spring Boot backend at `http://localhost:8080/api/v1/apods`. 
Ensure it handles pagination parameters (`page` and `size`) and demonstrates how to include a stored JWT token in the `Authorization: Bearer` header.
```

### Prompt 6.2: GraphQL Client
```text
In my React/Vue frontend, show me how to set up Apollo Client (or `urql`) pointing to `http://localhost:8080/graphql`. 
Write a sample GraphQL query string that fetches a list of APODs, requesting ONLY the `title` and `url` fields. Show how to execute this query in a component.
```

### Prompt 6.3: WebSocket Client
```text
In my frontend JavaScript code, write a snippet that uses the native `WebSocket` API to connect to `ws://localhost:8080/ws/notifications`. 
Add an `onmessage` event listener that logs the incoming data to the console and shows a browser `alert` (or UI toast) when a message is received.
```

### Prompt 6.4: Agent Chat UI
```text
Write a frontend component for the AI Chat Agent. 
It should have an input field for the prompt and a display area for the response. 
When the user submits a prompt, use the native `EventSource` API to connect to `http://localhost:8080/api/v1/agent/chat?prompt=...`. 
Implement the `onmessage` listener to append the incoming chunks to a state variable, simulating a real-time typing effect in the display area. Close the connection when an [DONE] or equivalent terminating signal is received.
```
