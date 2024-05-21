# Fuwa - A Real-Time Chat App

Demo: https://fuwa-chat.netlify.app

## Overview

This is a serverless real-time chat application built with Vite, Vue 3, Firestore 10, Vuetify, and Cloudinary. It provides a seamless and interactive chatting experience with real-time updates.

## Features

- **Real-Time Chatting:** Experience instant messaging with real-time updates, users can search, join or create chat groups and interact with other people.
- **User Authentication:** Login via Google 0Auth, secure your chat with user authentication.
- **Image Sharing:** Share images effortlessly using Cloudinary integration.
- 
## Technologies Used

| Technology   | Description                                       |
| ------------ | ------------------------------------------------- |
| Vite         | Frontend build tool and development server        |
| Vue 3        | JavaScript framework for building user interfaces |
| Firestore 10 | Cloud-hosted NoSQL database                       |
| Typesense    | Full-text searching                               |
| Vuetify      | Material Design component library for Vue         |
| Cloudinary   | Cloud-based image and video management platform   |
| Gemini API   | For chat bot                                      |

## Getting Started

Follow these steps to set up and run the project locally:

```bash
# Clone the repository
git clone https://github.com/ayakase/Fuwa.git

# Navigate to the project directory
cd Fuwa

# Install dependencies
npm install

# env file

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API=
VITE_TYPESENSE_API=
VITE_TYPESENSE_HOST=

# Start the development server
npm run dev
```
