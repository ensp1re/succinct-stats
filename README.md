# Succinct Stats API Documentation

Welcome to the **Succinct Stats API** documentation. This API provides endpoints to interact with leaderboard data for the Succinct Stats platform.

## Base URL

```
https://www.succinct-stats.xyz/
```

---

## Endpoints

### 1. **Get User by Username**

Retrieve leaderboard data for a specific user.

### **Get All Leaderboard Data**

Retrieve all leaderboard data without filters.

- **Endpoint**: `/api/leaderboard`
- **Method**: `GET`
- **Response**:

  ```json
  {
      "data": [ ... ],
      "total": 1000
  }
  ```

- **Endpoint**: `/api/leaderboard?action=getByUsername&username={username}`
- **Method**: `GET`
- **Query Parameters**:
  - `username` (string): The username of the user (e.g., `@user` or `0x123`).
- **Response**:
  ```json
  {
      "data": { ... },
      "progress": {
          "proofs": 50,
          "stars": 75,
          "cycles": 90
      },
      "topPercentage": "1.23"
  }
  ```

---

### 2. **Get Leaderboard by Page**

Retrieve paginated leaderboard data.

- **Endpoint**: `/api/leaderboard?action=getByPage&page={page}&entriesPerPage={entriesPerPage}`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (integer): The page number.
  - `entriesPerPage` (integer): Number of entries per page.
- **Response**:
  ```json
  {
      "data": [ ... ],
      "total": 100
  }
  ```

---

### 3. **Top Inviters Leaderboard**

Retrieve a paginated leaderboard of top inviters.

- **Endpoint**: `/api/leaderboard?action=topInvitersLeaderboardByPage&page={page}&entriesPerPage={entriesPerPage}`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (integer): The page number.
  - `entriesPerPage` (integer): Number of entries per page.
- **Response**:
  ```json
  {
    "data": [
      { "rank": 1, "inviter": "@user1", "count": 10 },
      { "rank": 2, "inviter": "@user2", "count": 8 }
    ],
    "total": 50
  }
  ```

---

### 4. **Get Star Ranges**

Retrieve the distribution of users based on their star counts.

- **Endpoint**: `/api/leaderboard?action=getStarRanges`
- **Method**: `GET`
- **Response**:
  ```json
  [
    { "range": "1-2,500", "count": 50 },
    { "range": "2,501-5,000", "count": 30 },
    { "range": "5,001-10,000", "count": 15 },
    { "range": "10,001+", "count": 5 }
  ]
  ```

---

### 5. **Get Network Stats**

Retrieve overall statistics for the network.

- **Endpoint**: `/api/leaderboard?action=getNetworkStats`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "totalProvers": 1000,
    "totalStars": 500000,
    "totalCycles": 200000,
    "totalProofs": 300000
  }
  ```

---

### 6. **Get Top Performers**

Retrieve the top performers on the leaderboard.

- **Endpoint**: `/api/leaderboard?action=getTopPerformers&limit={limit}`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (integer): Number of top performers to retrieve.
- **Response**:
  ```json
  [
    { "rank": 1, "name": "@user1", "stars": 10000 },
    { "rank": 2, "name": "@user2", "stars": 9500 }
  ]
  ```

---

## Error Responses

- **404 Not Found**: Returned when no data is found for the given query.
  ```json
  { "error": "User not found" }
  ```
- **500 Internal Server Error**: Returned when there is an issue processing the request.
  ```json
  { "error": "Error reading leaderboard data" }
  ```

---

## Notes

- Ensure that query parameters are properly encoded.
- For large datasets, use pagination to avoid performance issues.

Happy coding! 🚀
