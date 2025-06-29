# CrowdShadow Chrome Extension

CrowdShadow is a powerful Chrome extension that enhances your browsing experience by showing you real-time discussions and insights from platforms like Hacker News (and potentially more in the future) related to the webpage you're currently viewing. Get immediate context and diverse opinions right in your sidebar!

## Features

- **Real-time Discussions:** Instantly see relevant Hacker News discussions for the current webpage.
- **Intelligent Querying:** Utilizes advanced keyword extraction and fallback logic to find the most relevant discussions based on the page's title and URL.
- **Dynamic Sidebar:** A sleek, collapsible sidebar that slides in from the right.
- **Persistent Floating Icon:** When the sidebar is closed, a semi-transparent "CS" icon remains visible on the page, allowing for quick re-opening with a single click.
- **Seamless Integration:** Designed to blend smoothly with your browsing experience without intrusive pop-ups.

## Getting Started

Follow these steps to get CrowdShadow up and running in your Chrome browser.

### Prerequisites

- Node.js (LTS version recommended)
- npm (Node Package Manager, comes with Node.js)
- Google Chrome browser

### Installation

1. **Clone the Repository:**
First, clone this repository to your local machine:
    
    ```
    git clone https://github.com/gautamkumar34/CrowdShadow-Chrome-Extension/
    cd CrowdShadow
    
    ```
    
    
2. **Install Dependencies:**
Navigate into the `client` directory and install the React app dependencies:
    
    ```
    cd client
    npm install
    
    ```
    
    Then, go back to the root `CrowdShadow` directory.
    
3. **Build the React Application:**
Build the React frontend which generates the `dist` folder containing the `sidebar.html`, `sidebar.js`, and `sidebar.css` files:
    
    ```
    npm run build
    
    ```
    
    This command compiles the React application into static assets.
    
4. **Load the Extension in Chrome:**
    - Open Google Chrome.
    - Navigate to `chrome://extensions`.
    - Enable **"Developer mode"** by toggling the switch in the top-right corner.
    - Click on the **"Load unpacked"** button that appears.
    - In the file dialog, navigate to and select your `CrowdShadow` project folder (the root folder containing `manifest.json`, `background.js`, `content.js`, etc.).
    - The CrowdShadow extension should now appear in your list of extensions.

## How to Use

1. **Open a Webpage:** Navigate to any website in your Chrome browser.
2. **Toggle Sidebar:**
    - Click on the **CrowdShadow icon** in your Chrome toolbar (usually next to the address bar).
    - Select "Toggle Sidebar" from the popup. The sidebar will slide open from the right side of your browser window.
3. **Close Sidebar:**
    - Click the **"×" (cross) button** located at the top-right corner *inside* the sidebar. The sidebar will smoothly slide closed.
4. **Re-open Sidebar (Floating Icon):**
    - After closing, a semi-transparent **"CS" icon** will appear at the bottom-right corner of the webpage.
    - Click this "CS" icon to instantly re-open the sidebar.
5. **Navigate Pages:** As you navigate to different webpages, the sidebar will automatically update with relevant discussions for the new URL.

## Technologies Used

- **React:** For building the interactive sidebar UI.
- **Vite:** A fast build tool for the React frontend.
- **Tailwind CSS:** For efficient and responsive styling within the React sidebar.
- **Hacker News Algolia API:** The primary data source for discussions.
- **Chrome Extension APIs:** `chrome.runtime`, `chrome.tabs`, `chrome.scripting` for core extension functionality and inter-component communication.

## Future Enhancements

- **Multi-Platform Discussions:** Integrate discussions from Reddit and X (Twitter) by implementing their respective APIs (note: X/Twitter API currently has significant access restrictions).
- **User Preferences:** Allow users to customize sidebar appearance, default state, and preferred discussion sources.
- **Discussion Filtering/Sorting:** Add options to filter discussions by popularity, comments, or date.
- **Discussion Summaries:** Integrate LLMs (like Gemini API) to provide quick summaries of long discussion threads.
- **Contextual Analysis:** Utilize LLMs to analyze page content and suggest more nuanced search queries.
- **Authentication & Data Persistence:** Implement Firebase Firestore for user-specific settings or notes.

🤝 Contributing
Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature-name).
Make your changes.
Commit your changes (git commit -m 'Add new feature').
Push to the branch (git push origin feature/your-feature-name).
Open a Pull Request.

----------------------

MADE BY GAUTAM <3.
