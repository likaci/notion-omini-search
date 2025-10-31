const TAG = 'Notion Omni Search';
const SEARCH_KEYWORD_PARAM = 'nos';
const SEARCH_BUTTON_ICON_SELECTOR = '.magnifyingGlass';
const SEARCH_INPUT_ICON_SELECTOR = '.notion-dialog input[type="text"]'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getSearchKeyword() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get(SEARCH_KEYWORD_PARAM);
    return keyword ? decodeURIComponent(keyword) : null;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log(`${TAG}: Keyword copied to clipboard`);
    } catch (error) {
        console.error(`${TAG}: Failed to copy to clipboard: ${error}`);
    }
}

function showFallbackToast(keyword) {
    console.log(`${TAG}: Showing fallback toast`);

    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fcd34d;
        color: black;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        max-width: 300px;
        cursor: pointer;
      ">
        <div style="margin-bottom: 8px; font-weight: 600;">
          Notion Omni Search Failed ☹️
        </div>
        <div style="margin-bottom: 8px;">
          Keyword <strong>"${keyword}"</strong> copied to clipboard.\n Pressing Cmd+K or Ctrl+K to search manually.
        </div>
      </div>
    `;

    document.body.appendChild(toast);
    copyToClipboard(keyword);

    const removeToast = () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    };

    setTimeout(removeToast, 3000);
    toast.addEventListener('click', removeToast);
}

async function search(keyword) {
    console.log(`${TAG}: Attempting to search for: ${keyword}`);

    let tryCount = 0;
    let searchButtonIcon = document.querySelector(SEARCH_BUTTON_ICON_SELECTOR);
    while (!searchButtonIcon && tryCount < 10) {
        searchButtonIcon = document.querySelector(SEARCH_BUTTON_ICON_SELECTOR);
        tryCount++;
        await sleep(100);
    }

    if (!searchButtonIcon) {
        console.log(`${TAG}: Search button icon not found`);
        showFallbackToast(keyword);
        return;
    }

    const searchButton = searchButtonIcon.parentElement;
    console.log(`${TAG}: Found search button`);
    searchButton.click();
    await sleep(100);

    tryCount = 0;
    let searchInputIcon = document.querySelector(SEARCH_INPUT_ICON_SELECTOR);
    while (!searchInputIcon && tryCount < 10) {
        searchInputIcon = document.querySelector(SEARCH_INPUT_ICON_SELECTOR);
        tryCount++;
        await sleep(100);
    }
    if (!searchInputIcon) {
        console.log(`${TAG}: Search input icon not found`);
        showFallbackToast(keyword);
        return;
    }

    const searchInput = searchInputIcon.parentElement.parentElement.parentElement.querySelector('input');
    console.log(`${TAG}: Found search input, filling with keyword`);
    searchInput.value = keyword;
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`${TAG}: Search successful`);
}

(async () => {
    console.log(`${TAG}: Content script loaded`);
    const keyword = getSearchKeyword();
    if (!keyword) return;
    console.log(`${TAG}: Found keyword: ${keyword}`);
    await search(keyword);
})();