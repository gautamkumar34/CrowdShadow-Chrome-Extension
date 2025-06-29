// CrowdShadow/content.js
let sidebarIframe = null;
let floatingIcon = null;
const SIDEBAR_ID = 'crowdshadow-sidebar-iframe';
const FLOATING_ICON_ID = 'crowdshadow-floating-icon';

function createFloatingIcon() {
    if (floatingIcon && document.getElementById(FLOATING_ICON_ID)) {
        floatingIcon.classList.add('visible');
        return;
    }

    floatingIcon = document.createElement('div');
    floatingIcon.id = FLOATING_ICON_ID;
    floatingIcon.textContent = 'CS';
    floatingIcon.title = 'Open CrowdShadow Sidebar';

    floatingIcon.addEventListener('click', () => {
        toggleSidebarVisibility(true);
    });

    document.body.appendChild(floatingIcon);
    setTimeout(() => {
        if (floatingIcon) {
            floatingIcon.classList.add('visible');
        }
    }, 50);
}

function hideFloatingIcon() {
    if (floatingIcon && document.getElementById(FLOATING_ICON_ID)) {
        floatingIcon.classList.remove('visible');
        floatingIcon.style.pointerEvents = 'none';

        setTimeout(() => {
            if (floatingIcon && floatingIcon.parentNode) {
                floatingIcon.parentNode.removeChild(floatingIcon);
            }
            floatingIcon = null;
        }, 350);
    }
}

function injectSidebar(shouldShow = false) {
    if (document.getElementById(SIDEBAR_ID)) {
        const iframe = document.getElementById(SIDEBAR_ID);
        if (shouldShow) {
            iframe.style.width = '350px';
            hideFloatingIcon();
        } else {
            iframe.style.width = '0px';
            createFloatingIcon();
        }
        sidebarIframe = iframe;
        return;
    }

    sidebarIframe = document.createElement('iframe');
    sidebarIframe.id = SIDEBAR_ID;
    sidebarIframe.className = 'crowdshadow-sidebar';
    sidebarIframe.src = chrome.runtime.getURL('dist/sidebar.html');

    sidebarIframe.style.width = '0px';
    sidebarIframe.style.transition = 'width 0.3s ease-in-out';
    sidebarIframe.style.position = 'fixed';
    sidebarIframe.style.top = '0';
    sidebarIframe.style.right = '0';
    sidebarIframe.style.height = '100%';
    sidebarIframe.style.zIndex = '999999';
    sidebarIframe.style.border = 'none';
    sidebarIframe.style.backgroundColor = 'transparent';

    document.body.appendChild(sidebarIframe);

    sidebarIframe.onload = () => {
        chrome.runtime.sendMessage({ action: "getCurrentTabInfo" }, (response) => {
            if (chrome.runtime.lastError) {
                return;
            }
            if (response && response.url && response.title) {
                sendUrlToSidebar(response.url, response.title);
            }
        });

        if (shouldShow) {
            sidebarIframe.style.width = '350px';
            hideFloatingIcon();
        } else {
            sidebarIframe.style.width = '0px';
            createFloatingIcon();
        }
    };
}

function sendUrlToSidebar(url, title) {
    if (sidebarIframe && sidebarIframe.contentWindow) {
        sidebarIframe.contentWindow.postMessage({
            type: 'UPDATE_URL',
            url: url,
            title: title
        }, '*');
    }
}

function toggleSidebarVisibility(forceOpen = false) {
    if (!sidebarIframe || !document.getElementById(SIDEBAR_ID)) {
        injectSidebar(true);
        return true;
    } else {
        const isCurrentlyVisible = sidebarIframe.style.width === '350px';

        if (forceOpen || !isCurrentlyVisible) {
            sidebarIframe.style.width = '350px';
            hideFloatingIcon();
            return true;
        } else {
            sidebarIframe.style.width = '0px';
            createFloatingIcon();
            return false;
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
        const isVisible = toggleSidebarVisibility();
        sendResponse({ isVisible: isVisible });
        return true;
    }
    else if (request.action === "closeSidebarFromBackground") {
        toggleSidebarVisibility(false);
        sendResponse({ success: true });
    }
    else if (request.action === "urlChanged") {
        if (sidebarIframe && document.getElementById(SIDEBAR_ID)) {
            sendUrlToSidebar(request.url, request.title);
            if (sidebarIframe.style.width === '350px') {
                hideFloatingIcon();
            } else {
                createFloatingIcon();
            }
        } else {
            injectSidebar(false);
            setTimeout(() => {
                sendUrlToSidebar(request.url, request.title);
            }, 100);
        }
    }
});

injectSidebar(false);