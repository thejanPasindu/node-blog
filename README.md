# node-event-app
Simple event management web application

## Database Schema
User (id, name, email, password, phone, role)

Event (id, name, category, description, organizer, place, picture, datetime, rank)

## Used Technologies
- MongoDB as database management system.
- NodeJS + Express as backend server.
- EJS as server-side template engine that convert *.ejs formatted JavaScript files to clientside html.
- The bcryptjs library for password hashing and validation.
- The passport-js library for user authentication
- The mongoose for database connectivity and management.

## Structure of the web application
This web application is used MVC architecture. Model, Views, and Controllers are follows,
- Models:
  - User Model
  - Event Model
- Views:
  - Registration
  - Login
  - Dashboard
  - Add Event
  - Edit Event
  - My Events
  - View Event
- Controllers:
  - Index.js - control common and public routes/requests.
  - User.js - control user specific routes/requests. (Ex: login, registration)
  - Event.js - control event specific routes/requests. (Ex: create event, delete event, edit event)  
  
For more clearance, activity diagram like follows,

![Activity Diagram](/images/activity_diagram.png "Title is optional")
