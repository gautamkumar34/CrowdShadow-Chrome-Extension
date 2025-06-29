// CrowdShadow/client/src/SidebarApp.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './index.css'; 

function SidebarApp() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [hnResults, setHnResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cleanAndExtractKeywords = useCallback((text, url) => {
    if (!text) return '';

    text = text.toLowerCase();
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?\[\]<>`]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'about', 'as', 'into', 'like',
      'to', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
      'don', 'should', 'now', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her',
      'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they',
      'them', 'their', 'theirs', 'themselves', 'i', 'me', 'my', 'myself',
      'news', 'videos', 'world', 'us', 'breaking', 'stories', 'blogs', 'com', 'org', 'www', 'https', 'http',
      'home', 'page', 'main', 'site', 'article', 'post', 'blog', 'index', 'html', 'php', 'asp', 'aspx', 'jsp',
      'document', 'file', 'data', 'information', 'guide', 'tutorial', 'overview', 'overview_page',
      'developer', 'community', 'help', 'support', 'about', 'contact', 'privacy', 'terms', 'cookies',
      'login', 'register', 'signin', 'signup', 'account', 'profile', 'dashboard'
    ]);

    let words = text.split(' ').filter(word => {
      return word.length > 1 && !stopWords.has(word);
    });

    let finalSearchTerm = words.join(' ');

    if (url && url.includes('google.com/search')) {
      try {
        const urlObj = new URL(url);
        const urlParams = new URLSearchParams(urlObj.search);
        const q = urlParams.get('q');
        if (q) finalSearchTerm = decodeURIComponent(q.replace(/\+/g, ' '));
      } catch (e) {
        /* No console.warn here */
      }
    } else if (url && url.includes('wikipedia.org')) {
      try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');
        let lastPart = parts[parts.length - 1];
        if (lastPart) {
          lastPart = lastPart.split('#')[0].split('?')[0];
          finalSearchTerm = decodeURIComponent(lastPart.replace(/_/g, ' ')).replace(/ - Wikipedia$/, '');
        }
      } catch (e) {
        /* No console.warn here */
      }
    }

    finalSearchTerm = finalSearchTerm.trim();
    if (finalSearchTerm.length > 80) {
      finalSearchTerm = finalSearchTerm.substring(0, 80);
    }

    finalSearchTerm = finalSearchTerm.replace(/-\s*$/, '');
    finalSearchTerm = finalSearchTerm.replace(/^(a|an|the)\s+/, '');

    return finalSearchTerm;
  }, []);

  const fetchDiscussions = useCallback(async (url, title) => {
    setIsLoading(true);
    setError(null);
    setHnResults([]);

    let searchTerm = cleanAndExtractKeywords(title || url, url);

    if (!searchTerm.trim() || searchTerm.length < 3) {
      let fallbackTerm = title || (url ? url.split('/').filter(Boolean).pop() : '');

      if (url && url.includes('google.com/search')) {
        try {
          const urlObj = new URL(url);
          const urlParams = new URLSearchParams(urlObj.search);
          const q = urlParams.get('q');
          if (q) fallbackTerm = decodeURIComponent(q.replace(/\+/g, ' '));
        } catch (e) { /* ignore */ }
      } else if (url && url.includes('wikipedia.org')) {
        try {
          const urlObj = new URL(url);
          const parts = urlObj.pathname.split('/');
          let lastPart = parts[parts.length - 1];
          if (lastPart) {
            lastPart = lastPart.split('#')[0].split('?')[0];
            fallbackTerm = decodeURIComponent(lastPart.replace(/_/g, ' '));
          }
        } catch (e) { /* ignore */ }
      }

      fallbackTerm = fallbackTerm ? fallbackTerm.replace(/ - Wikipedia$/, '').replace(/\W/g, ' ').trim() : '';

      if (fallbackTerm.length > 100) {
          fallbackTerm = fallbackTerm.substring(0, 100);
      }

      if (fallbackTerm.trim()) {
        searchTerm = fallbackTerm;
      } else {
        setError("No relevant text to search for.");
        setIsLoading(false);
        return;
      }
    }

    if (!searchTerm.trim()) {
        setError("No relevant text to search for after all attempts.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetchHNData", query: searchTerm }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        });
      });

      if (response && response.success) {
        if (response.data && response.data.length > 0) {
            setHnResults(response.data);
            setError(null);
        } else {
            setHnResults([]);
            setError("No significant Hacker News discussions found.");
        }
      } else {
        setError(response.error || "Failed to fetch discussions.");
        setHnResults([]);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred while fetching.");
      setHnResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [cleanAndExtractKeywords]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'UPDATE_URL' && event.origin === chrome.runtime.getURL('')) {
        const { url, title } = event.data;
        setCurrentUrl(url);
        setCurrentTitle(title);
        fetchDiscussions(url, title);
      }
    };

    window.addEventListener('message', handleMessage);

    chrome.runtime.sendMessage({ action: "getCurrentTabInfo" }, (response) => {
      if (chrome.runtime.lastError) {
        /* No console.error here */
        return;
      }
      if (response && response.success && response.url && response.title) {
        setCurrentUrl(response.url);
        setCurrentTitle(response.title);
        if (response.url !== currentUrl || response.title !== currentTitle) {
            fetchDiscussions(response.url, response.title);
        }
      } else {
        /* No console.warn here */
      }
    });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchDiscussions, currentUrl, currentTitle]);

  const handleCloseSidebar = () => {
    chrome.runtime.sendMessage({ action: "closeSidebarFromSidebar" });
  };

  return (
    <div className="crowdshadow-sidebar-content p-4 text-white font-sans overflow-auto h-full bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-300">CrowdShadow</h2>
        <button
          onClick={handleCloseSidebar}
          className="text-gray-300 hover:text-white focus:outline-none text-2xl font-bold"
          title="Close Sidebar"
        >
          &times;
        </button>
      </div>

      <p className="mb-2 text-gray-300">
        <span className="font-semibold">Current:</span> {currentTitle || currentUrl || 'N/A'}
      </p>

      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-stone-300">Discussions (Hacker News)</h3>

      {isLoading && <p className="text-gray-400">Loading discussions...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!isLoading && !error && hnResults.length === 0 && (
        <p className="text-gray-400">No significant discussions found on Hacker News for this page in the last 30 days.</p>
      )}

      {!isLoading && !error && hnResults.length > 0 && (
        <ul className="space-y-3">
          {hnResults.map((result, index) => (
            <li key={index} className="bg-gray-700 p-3 rounded-md shadow-sm">
              <a href={result.url || `https://news.ycombinator.com/item?id=${result.objectID}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline block text-base font-medium">
                {result.title}
              </a>
              <p className="text-sm text-gray-400 mt-1">
                Points: {result.points} | Comments: {result.num_comments}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SidebarApp;