// const HomePage = () => {
//     return (
//         <div>
//             <h1>Home Page</h1>
//         </div>
//     )
// };
// 
// export default HomePage;
// 
// client/src/pages/HomePage.tsx
import React from 'react';
import '../../src/homePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <h2 className="homepage-heading">Welcome to LoopLab!</h2>
      <p className="homepage-paragraph">Your next break through is a scetch away.</p>
    </div>
  );
};

export default HomePage;
