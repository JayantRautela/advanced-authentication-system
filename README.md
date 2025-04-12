# Advanced Authentication System

A fully-fledged authentication system designed to provide robust security features for web applications. This system encompasses user registration, login, password management, and session handling, ensuring a secure and seamless user experience.

## Features

- **User Registration**: Secure user sign-up with validation checks.
- **Email Verification**: After Registration Users recieve a email to verify their email.
- **User Login**: Authentication with encrypted credentials.
- **Login Via OTP**: Users can login using OTP.
- **Password Management**: Secure password storage and reset functionality.
- **Session Handling**: Maintain user sessions with proper session management.
- **Frontend and Backend Separation**: Modular codebase with distinct frontend and backend directories.

## Technologies Used

- **Frontend**: ReactJS + TypeScript, React-Router-DOM, Redux toolkit
- **Styling**: TailwindCSS and shadcn
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for password hashing
- **Email**: NodeMailer for sending emails

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/JayantRautela/advanced-authentication-system.git

# 2. Navigate to the project directory
cd advanced-authentication-system

# 3. Install backend dependencies
cd backend
npm install

# 4. Install frontend dependencies
cd ../frontend
npm install

```

## Starting the Project

```bash
cd backend
npm run dev

cd frontend
npm run dev
```