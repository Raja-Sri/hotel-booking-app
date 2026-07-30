# Hotel Booking Application
A full-stack hotel booking platform that allows customers to browse hotels, explore rooms, make bookings, and manage reservations. The application also provides an admin dashboard for managing hotels, rooms, and bookings.


## Features

### Customer

- User Registration & Login
- JWT Authentication
- Browse Hotels
- View Hotel Details
- Explore Available Rooms
- Book Rooms
- View Booking History
- Responsive User Interface

### Admin

- Secure Admin Login
- Manage Hotels
- Manage Rooms
- View Bookings
- Update Hotel Information
- Delete Hotels and Rooms


## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- HTML
- CSS
- JavaScript

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- Maven

### Database

- MySQL


## Project Structure

```
hotel-booking-app/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```


## Key Functionalities

- User authentication using JWT
- Role-based authorization (Customer/Admin)
- Hotel and room management
- Booking management
- Dynamic hotel listing
- Responsive frontend
- RESTful APIs


## Installation

### Clone the repository

```bash
git clone https://github.com/Raja-Sri/hotel-booking-app.git
cd hotel-booking-app
```

---

## Backend Setup

Navigate to the backend folder

```bash
cd backend
```

Configure your MySQL database in:

```
application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Run the backend

```bash
./mvnw spring-boot:run
```

or

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## Frontend Setup

Navigate to the frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run the frontend

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## Technologies Used

- Java
- Spring Boot
- Spring Security
- JWT
- MySQL
- Hibernate (JPA)
- React
- Vite
- TypeScript
- REST APIs


## Future Enhancements

- Email Notifications
- Hotel Reviews and Ratings
- Wishlist Feature


## Author

**Raja Sri Yayavaram**

B.Tech CSE (Data Science)

GitHub: https://github.com/Raja-Sri
