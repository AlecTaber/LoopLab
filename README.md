# LoopLab
  ![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
## Description 

LoobLab is an innovative social media platform that allows users to create and share art with flipnote style animations. LoobLab is an application full of interactive features that allow creativity and collaboration for people wanting to connect through art and media.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)
- [Tests](#tests)
- [Contact](#contact)

## Installation

To install this application on your local machine, you will first need to clone down this repository using the git clone command in your terminal. After cloning the repo, navigate to where you stored the project and run an npm install to install the dependencies needed to use the app. Once the dependencies are installed, create a .env file in both your client and server folders. The client side folder will need a VITE_CLOUDINARY_URL, a VITE_CLOUDINARY_NAME, and a VITE_CLOUDINARY_PRESET. The .env in the server will need a JWT_SECRET and a MONGO_URI. When you have the .env files set up, do an npm run build, followed by an npm run develop. Running these scripts will start the backend server and the frontend application. If you do not want to get the application running locally, we have a live deployed site where you can create your next masterpiece! "live site here"

## Usage

Users can create an account using their email and a unique username, then sign into their new account in order to use the application to its fullest extint. Feel free to navigate the home page where you will see many other users creations, click the profile button to visit a users page, leave likes and share your thoughts on their work with comments! Want to create a work of your own imagination? Visit the canvas page where you have an abundance of tools to draw a picture, or multiple pictures to make an animation of whatever you want! Once you are done with your new work of art, view it on your own profile page to see if anyone has left a like or comment on it yet!

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, GraphQL, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Cloud Storage**: Cloudinary for storing compressed frame data
- **Authentication**: JWT for secure user authentication
- **Build & Deployment**: Render (with data persistence)
- **Version Control**: Git, GitHub (with GitHub Actions for CI/CD)

## Features

- **Register & Login**: Create an account and login to keep track of all of your Loops.
- **Create Animations**: Design frame-by-frame animations using a variety of tools, including customizable colors and brush sizes.
- **Social Interaction**: React to and comment on friends' creations for collaborative feedback.
- **Users**: Visit other users pages to view their creations.
- **Responsive Design**: Access and use LoopLab seamlessly across all devices.

## Code Snippets

code snippets here

## Credits

This application was created by Ashlin Lee, Alec Taber, Joseph Norris, and Joshua Pruitt.

## License
  
  This project uses the MIT License. For more information, visit [license link](https://opensource.org/licenses/MIT).


## Tests

To test this application, use the npm run test command in your terminal. It will then send you to the cypress interaface, where you can test both E2E  and Components. Cypress will run the tests automatically and you will be able to see if the tests have passed or failed.

## Contact

- GitHub: Ashlin
- Email: 

- GitHub: [AlecTaber](https://github.com/AlecTaber)
- Email: [alectaber12@gmail.com](mailto:alectaber12@gmail.com)

- GitHub: Joseph
- Email: 

- GitHub: Joshua
- Email: 

