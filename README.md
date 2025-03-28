# URL Shortener Service

A simple URL shortening service similar to Bit.ly built with Node.js, Express, MongoDB, and Redis.

## Overview

This project implements a URL shortener that exposes two main API endpoints:

- **POST /shorten**  
  Creates a short URL for a given long URL. Supports an optional custom alias (e.g., `/shorten?alias=mycustomname`) and an optional expiration date. The service ensures that the same long URL generates the same short code when no custom alias is provided.

- **GET /:shortId**  
  Redirects the user to the original long URL. It also increments and tracks the number of times a short URL is clicked. Redis is used to cache the URL and click count for high-performance retrieval, while MongoDB serves as the persistent store.

### Key Features

- **Custom Alias:**  
  Use the query parameter `alias` to specify a custom short code. If the alias already exists, the API returns a conflict error.

- **Expiration Handling:**  
  Supports an expiration date for short URLs. If a URL is expired, the API returns a `410 Gone` response.

- **Statistics Tracking:**  
  Each short URL stores the number of times it has been clicked, which is updated in MongoDB and cached in Redis.

- **Scalability:**  
  With Redis caching and MongoDB's robust storage, the system is designed to scale for high traffic.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (for storing URL mappings and click counts)
- **Cache:** Redis (for caching URL data)
- **Optional:** Nginx (for load balancing multiple backend instances)

## Running the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- MongoDB (either a local instance or a MongoDB Atlas cluster)
- Redis (either a local instance or a remote server)

### Setup Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/short_url_giva.git
   cd short_url_giva
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file in the project root (if you prefer using env variables) and add necessary variables, for example:
   ```env
   PORT=8001
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ozzk9.mongodb.net/short_urls?retryWrites=true&w=majority
   REDIS_URL=redis://:yourRedisPassword@hopper.proxy.rlwy.net:39869
   ```
   *Note: *The current code uses default values if environment variables are not set.
4. **Run the Application**
   ```bash
   npm start
   ```
   The server should start and listen on the specified port (default is 8001).
## Example API Requests & Responses
1. **Shorten a URL**
   Request
   ```bash
   curl -X POST \
   -H "Content-Type: application/json" \
   -d '{"url": "https://chatgpt.com", "expirationDate": "2025-03-23T18:03:00Z"}' \
   http://localhost:8001/shorten
   ```
   *With custom alias:*
   ```bash
   curl -X POST \
   -H "Content-Type: application/json" \
   -d '{"url": "https://chatgpt.com"}' \
   "http://localhost:8001/shorten?alias=mycustomname"
   ```
   Response
   ```json
   {
   "shortId": "generatedShortID" // or "mycustomname" if custom alias was used
   }
   ```
   Using Postman:
   - Method: POST
   - URL: http://localhost:8001/shorten
   - Headers:
     - Content-Type: application/json
   - Body (raw JSON):
    ```json
    {
    "url": "https://chatgpt.com",
    "expirationDate": "2025-03-23T18:03:00Z"
    }
    ```
  With Custom Alias:
  - URL: http://localhost:8001/shorten?alias=mycustomname
  - Body (raw JSON):
    ```json
    {
    "url": "https://chatgpt.com"
    }
  Expected Response:
  ```json
{
  "shortId": "generatedShortID"  // or "mycustomname" if a custom alias is used
}
```



3. **Redirect to Original URL**
   Once a short URL is generated (e.g., `generatedShortID`), visiting:
   ```bash
   http://localhost:8001/generatedShortID
   ```
   will redirect you to `https://chatgpt.com`.
   - If the URL is expired, you'll receive a JSON response with a 410 status:
     ```json
     { "message": "Link expired" }
     ```
   - If the short URL does not exist, you'll get a 404 response:
     ```json
     { "message": "Short URL not found" }
     ```
  Using Postman:
  - Method: GET
  - URL: http://localhost:8001/generatedShortID
  When you send a GET request to the generated short URL, you should be redirected to https://chatgpt.com. In Postman, you'll see the response indicating a redirection, or you can check the URL in the Postman console.
  Error Cases:
  - Expired URL:If the URL is expired, you'll receive:
    ```json
    { "message": "Link expired" }
    ```
  Non-existent Short URL:If the short URL does not exist, you'll get:
  ```json
  { "message": "Short URL not found" }
  ```


## Testing with Postman
1. **Create a New Request for Shortening a URL:**
   - Open Postman.
   - Create a new request, set the method to POST.
   - Enter the URL: `http://localhost:8001/shorten`
   - In the "Body" tab, select "raw" and "JSON", then enter the JSON payload.
   - Click "Send" to create the short URL.
2. **Create a New Request for Redirection:**
   - Copy the `shortId` returned from the previous request.
   - Create a new request in Postman, set the method to GET.
   - Enter the URL: `http://localhost:8001/<shortId>` (replace `<shortId>` with the actual value).
   - Click "Send" to follow the redirection.
   *Note:* Postman may not automatically follow redirections depending on settings, so you might need to check the "Follow Redirects" option in Postman's settings.
3. **Check Logs for Debugging:**
   - Use the Postman console (`View > Show Postman Console`) to see logs and additional details about the requests and responses.
     
## Conclusion
This project demonstrates a robust approach to building a URL shortener service that handles custom aliases, expiration, and click tracking, leveraging both MongoDB for persistence and Redis for performance. Feel free to contribute, open issues, or suggest enhancements.
