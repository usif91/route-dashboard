import { state, loadWorkbook, computeMatches, searchNearMe } from './data.js';
import { setStatus, updateCounts, renderNext, renderNextNear, renderRows } from './ui.js';
import { escapeHtml } from './utils.js';

const $ = (id) => document.getElementById(id);
const EXCEL_FILE = "data.xlsx";

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        setStatus("ok", `Copied: <b>${escapeHtml(text)}</b>`);
        setTimeout(() => setStatus("", ""), 1100);
    } catch (e) {
        // Fallback for some browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setStatus("ok", `Copied: <b>${escapeHtml(text)}</b>`);
        setTimeout(() => setStatus("", ""), 1100);
    }
}

function handleTableClick(e) {
    // Route click -> copy padded route
    const routeWrap = e.target.closest("[data-route-click]");
    if (routeWrap) {
        const route = routeWrap.getAttribute("data-route-click");
        if (route) copyText(String(route));
        return;
    }

    // Streetsort copy button
    const btn = e.target.closest("button");
    if (btn) {
        const copyRouteStreet = btn.getAttribute("data-copy-route-street");
        if (copyRouteStreet !== null) {
            const [route, street] = String(copyRouteStreet).split("|");
            copyText(`${route} ${street}`.trim());
            return;
        }
    }

    // Yard click -> toggle expansion
    const toggleWrap = e.target.closest("[data-toggle]");
    if (toggleWrap) {
        const key = String(toggleWrap.getAttribute("data-toggle"));
        if (state.expandedRoutes.has(key)) state.expandedRoutes.delete(key);
        else state.expandedRoutes.add(key);

        $("tbody").innerHTML = "";
        if (state.nearMode) {
            // Re-render near view partial
            const shown = state.nearSorted.slice(0, state.nearIndex).map(x => x.r);
            renderRows(shown, false);
        } else {
            // Re-render matches
            const shown = state.matches.slice(0, state.shown);
            renderRows(shown, false);
        }
    }
}

// Event Listeners
$("q").addEventListener("input", (e) => {
    state.query = e.target.value || "";
    state.userPos = null;
    setStatus("", "");
    computeMatches();
    renderNext(true); // Re-render with new matches
});

$("btnMore").addEventListener("click", () => {
    if (state.nearMode) renderNextNear();
    else renderNext(false);
});

$("btnNear").addEventListener("click", () => {
    searchNearMe(setStatus, () => {
        $("tbody").innerHTML = "";
        renderNextNear();
    });
});

$("tbody").addEventListener("click", handleTableClick);

// Init
loadWorkbook(EXCEL_FILE, setStatus, () => {
    updateCounts();
    computeMatches();
    renderNext(true);
});
