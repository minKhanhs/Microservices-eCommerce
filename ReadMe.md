# 🚀 E-Commerce Microservices Architecture

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-Enabled-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational_DB-316192?style=for-the-badge&logo=postgresql&logoColor=white)

> **Capstone Project - Hanoi University of Science and Technology (HUST)** > 🏆 **Grade:** 9.5/10 (A+)  
> 👨‍💻 **Author:** Le Minh Khanh

---

## 📖 Introduction

This project is a research-oriented implementation of an **E-commerce System** using **Microservices Architecture**. It moves beyond simple CRUD operations to tackle distributed system challenges such as **Domain-Driven Design (DDD)**, **Fault Tolerance**, **Distributed Transactions**, and **High-Performance Caching**.

The system simulates a real-world shopping flow including product browsing, cart management (high I/O), order processing, and online payment integration via VNPay.

## 🏗 System Architecture

The system is decomposed into independent microservices based on **Bounded Contexts** derived from DDD analysis.

### Core Services

| Service Name | Description | Database | Key Tech |
| :--- | :--- | :--- | :--- |
| **User Service** | Handles Authentication & Authorization (AuthN/AuthZ). | PostgreSQL | JWT, Spring Security |
| **Product Service** | Manages product catalog and inventory. | PostgreSQL | Caching |
| **Cart Service** | Handles temporary shopping cart data with high frequency I/O. | PostgreSQL | Key-Value Store |
| **Order Service** | Core domain logic for order lifecycle management. | PostgreSQL | Feign Client |
| **Payment Service** | **Anti-Corruption Layer (ACL)** for Payment Gateway integration. | PostgreSQL | VNPay SDK |

### Infrastructure Services
* **API Gateway (Spring Cloud Gateway):** Single entry point, routing, and load balancing.
* **Service Discovery (Netflix Eureka):** Dynamic service registration and discovery.

---

## 🛠 Tech Stack

### Backend
* **Language:** Java 17+
* **Framework:** Spring Boot 3.x
* **Microservices:** Spring Cloud (Gateway, OpenFeign, Eureka)
* **Resilience:** Resilience4j (Circuit Breaker, Retry, Rate Limiter)

### Data & Infrastructure
* **Databases:** PostgreSQL (Relational)
* **DevOps:** Docker, Docker Compose
* **Build Tool:** Maven

### Integration
* **Payment Gateway:** VNPay Sandbox (Checksum security & IPN flow)

---

## 💡 Engineering Highlights

### 1. Domain-Driven Design (DDD) Strategy
Instead of a monolithic database, I applied the **Database-per-Service** pattern.
* **Separation of Concerns:** The *Cart* logic (transient data) is physically separated from *Order* logic (historical data) to optimize performance and scalability.

### 2. Fault Tolerance with Circuit Breaker
Implemented **Resilience4j** to prevent cascading failures.
* *Scenario:* If the `Product Service` is down or slow, the `Order Service` will fail fast (Open Circuit) instead of hanging threads, ensuring the system remains responsive.

### 3. Secure Payment Flow
Integrated **VNPay** with a secure flow:
1.  Generate Payment URL with Secure Hash (HMAC-SHA512).
2.  Handle asynchronous callback (IPN) to update order status.
3.  Direct client redirect to Order Detail page.

---

## 🚀 Installation & Run

The entire system is containerized. You can run it with a single command.

### Prerequisites
* Docker & Docker Compose
* Java JDK 17+ (for local development)
* Maven

### Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/minKhanhs/Microservices-eCommerce
    ```

2.  **Build the JAR files**
    ```bash
    mvn clean package -DskipTests
    ```

3.  **Start the System**
    ```bash
    docker-compose up -d
    cd fronend-web
    npm run dev
    ```

4.  **Access the Application**
    * **Eureka Dashboard:** `http://localhost:8761`
    * **API Gateway:** `http://localhost:8080`

---
