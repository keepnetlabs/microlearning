// SCORM Package Download Utility
// Generates and downloads SCORM 1.2 compliant HTML package

import JSZip from 'jszip';

export const downloadSCORMPackage = () => {
  // Get current URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const baseUrl = urlParams.get('baseUrl') || 'https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001';
  const langUrl = urlParams.get('langUrl') || 'lang/en';
  const inboxUrl = urlParams.get('inboxUrl') || 'inbox/all';

  // Extract course title from baseUrl or use default
  const courseTitle = baseUrl.includes('/microlearning/')
    ? baseUrl.split('/microlearning/')[1]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Microlearning Course'
    : 'Microlearning Course';

  // Construct the iframe source URL
  const iframeSrc = `http://localhost:3000/?baseUrl=${encodeURIComponent(baseUrl)}&langUrl=${encodeURIComponent(langUrl)}&inboxUrl=${encodeURIComponent(inboxUrl)}`;

  // SCORM 1.2 compliant HTML content
  const scormHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Microlearning</title>
    <style>
      html,
      body,
      iframe {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        border: 0;
      }
      .spinner {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .spinner:after {
        content: "";
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #999;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div id="spinner" class="spinner"></div>
    <iframe id="mlFrame" allowfullscreen title="Microlearning"></iframe>

    <script>
      // --- SCORM 1.2 popup-safe wrapper ---
      var API = null;

      function truthy(v) {
        return v === "true" || v === true || v === 1 || v === "1";
      }

      function locateAPIInThisWindow(win) {
        try {
          if (win && win.API) return win.API;
        } catch (e) {}
        return null;
      }

      function searchUpParents(startWin, maxHops) {
        var win = startWin,
          hops = 0;
        while (win && hops < maxHops) {
          var api = locateAPIInThisWindow(win);
          if (api) return api;
          try {
            if (win.parent && win.parent !== win) {
              win = win.parent;
            } else {
              break;
            }
          } catch (e) {
            break;
          }
          hops++;
        }
        return null;
      }

      function searchFramesBreadthFirst(rootWin, maxNodes) {
        var seen = new Set();
        var q = [rootWin];
        var processed = 0;
        while (q.length && processed < maxNodes) {
          var w = q.shift();
          if (!w) continue;
          if (seen.has(w)) continue;
          seen.add(w);
          processed++;

          var api = locateAPIInThisWindow(w);
          if (api) return api;

          try {
            var len = 0;
            try {
              len = w.frames ? w.frames.length : 0;
            } catch (e) {}
            for (var i = 0; i < len; i++) {
              try {
                q.push(w.frames[i]);
              } catch (e) {}
            }
            try {
              if (w.parent && w.parent !== w) q.push(w.parent);
            } catch (e) {}
          } catch (e) {}
        }
        return null;
      }

      function locateAPI() {
        var api = searchUpParents(window, 500);
        if (api) return api;

        var op = null;
        try {
          op = window.opener || null;
        } catch (e) {
          op = null;
        }
        if (op) {
          api = searchUpParents(op, 50);
          if (api) return api;
          api = searchFramesBreadthFirst(op, 200);
          if (api) return api;
        }

        return null;
      }

      function tryInitOnce() {
        if (!API) API = locateAPI();
        if (!API) return false;
        try {
          var r = API.LMSInitialize("");
          var ok = truthy(r);
          if (!ok) console.warn("[SCORM] LMSInitialize returned falsy");
          return ok;
        } catch (e) {
          console.warn("[SCORM] LMSInitialize error", e);
          return false;
        }
      }

      function scormInitWithPoll(maxMs = 7000, stepMs = 150) {
        var start = Date.now();
        return new Promise(function (resolve) {
          (function tick() {
            if (tryInitOnce()) return resolve(true);
            if (Date.now() - start >= maxMs) return resolve(false);
            setTimeout(tick, stepMs);
          })();
        });
      }

      function scormGet(n) {
        try {
          return API ? API.LMSGetValue(n) : "";
        } catch (e) {
          return "";
        }
      }
      function scormSet(n, v) {
        try {
          return API ? truthy(API.LMSSetValue(n, String(v))) : false;
        } catch (e) {
          return false;
        }
      }
      function scormCommit() {
        try {
          return API ? truthy(API.LMSCommit("")) : false;
        } catch (e) {
          return false;
        }
      }
      function scormFinish() {
        try {
          return API ? truthy(API.LMSFinish("")) : false;
        } catch (e) {
          return false;
        }
      }

      function pad2(n) {
        return String(n).padStart(2, "0");
      }
      function formatTimeHHMMSS(d) {
        try {
          var h = pad2(d.getHours());
          var m = pad2(d.getMinutes());
          var s = pad2(d.getSeconds());
          return h + ":" + m + ":" + s;
        } catch (e) {
          return "00:00:00";
        }
      }
      function mapInteractionType(t) {
        var allowed = {
          "true-false": "true-false",
          choice: "choice",
          "fill-in": "fill-in",
          matching: "matching",
          performance: "performance",
          sequencing: "sequencing",
          likert: "likert",
          numeric: "numeric",
        };
        return allowed[t] || "choice";
      }
      function mapInteractionResult(r) {
        var allowed = {
          correct: "correct",
          wrong: "wrong",
          unanticipated: "unanticipated",
          neutral: "neutral",
        };
        return allowed[r] || "neutral";
      }

      function readLaunchData() {
        var raw = scormGet("cmi.launch_data");
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }

      (async function init() {
        var inited = await scormInitWithPoll();
        if (inited) {
          var status = scormGet("cmi.core.lesson_status");
          if (!status || status === "not attempted") {
            scormSet("cmi.core.lesson_status", "incomplete");
            scormCommit();
          }
        }

        var urlParams = new URLSearchParams(location.search);
        var pBase = urlParams.get("baseUrl");
        var pLang = urlParams.get("langUrl");
        var pInbox = urlParams.get("inboxUrl");
        var launch = readLaunchData() || {};
        var baseUrl = pBase || launch.baseUrl || "";
        var langUrl = pLang || launch.langUrl || "";
        var inboxUrl = pInbox || launch.inboxUrl || "";

        var qs = new URLSearchParams();
        if (baseUrl) qs.set("baseUrl", baseUrl);
        if (langUrl) qs.set("langUrl", langUrl);
        if (inboxUrl) qs.set("inboxUrl", inboxUrl);
        try {
          qs.set("parentOrigin", location.origin);
        } catch {}

        var frame = document.getElementById("mlFrame");
        frame.src = "${iframeSrc}";
        var childOrigin = (function () {
          try {
            return new URL(frame.src, location.href).origin;
          } catch (e) {
            return "http://localhost:3000";
          }
        })();
        frame.addEventListener("load", function () {
          document.getElementById("spinner")?.remove();
        });

        window.addEventListener("message", function (e) {
          if (e.origin !== childOrigin) return;
          var data = e.data || {};

          if (data.type === "scorm:getSuspendData") {
            var raw = scormGet("cmi.suspend_data") || "";
            var parsed = null;
            try {
              parsed = raw ? JSON.parse(raw) : null;
            } catch {
              parsed = null;
            }

            var loc = scormGet("cmi.core.lesson_location");
            var score = scormGet("cmi.core.score.raw");
            var status = scormGet("cmi.core.lesson_status") || "";

            var lastScene = (function (v) {
              var n = parseInt(v || "", 10);
              return isNaN(n) ? undefined : n;
            })(loc);
            var totalPoints = (function (v) {
              var n = parseInt(v || "", 10);
              return isNaN(n) ? undefined : Math.max(0, Math.min(100, n));
            })(score);

            if (!parsed) parsed = {};
            if (
              typeof parsed.lastScene !== "number" &&
              typeof lastScene === "number"
            )
              parsed.lastScene = lastScene;
            if (
              typeof parsed.totalPoints !== "number" &&
              typeof totalPoints === "number"
            )
              parsed.totalPoints = totalPoints;
            if (typeof parsed.status !== "string" && status)
              parsed.status = status;

            e.source.postMessage(
              { type: "scorm:suspendData", payload: parsed },
              e.origin
            );
          }

          if (data.type === "scorm:setSuspendData") {
            try {
              var incoming = data.payload || {};
              var prevRaw = scormGet("cmi.suspend_data") || "";
              var prev = {};
              try {
                prev = prevRaw ? JSON.parse(prevRaw) : {};
              } catch (e) {
                prev = {};
              }

              var clampScore = function (v) {
                var n = parseInt(v, 10);
                if (isNaN(n)) n = 0;
                return Math.max(0, Math.min(100, n));
              };
              var isTerminal = function (s) {
                return s === "passed" || s === "failed";
              };
              var mergeArraysUnique = function (a, b) {
                var arrA = Array.isArray(a) ? a : [];
                var arrB = Array.isArray(b) ? b : [];
                var m = new Map();
                arrA.concat(arrB).forEach(function (x) {
                  m.set(String(x), x);
                });
                return Array.from(m.values());
              };

              var merged = Object.assign({}, prev, incoming);

              merged.completedScenes = mergeArraysUnique(
                prev.completedScenes,
                incoming.completedScenes
              );

              var lastScenePrev =
                typeof prev.lastScene === "number" ? prev.lastScene : 0;
              var lastSceneIncoming =
                typeof incoming.lastScene === "number" ? incoming.lastScene : 0;
              merged.lastScene = Math.max(lastScenePrev, lastSceneIncoming);

              var scoreIncoming =
                typeof incoming.totalScore === "number"
                  ? incoming.totalScore
                  : prev.totalScore;
              merged.totalScore = clampScore(scoreIncoming);

              var prevSD =
                typeof prev.sceneData === "object" && prev.sceneData
                  ? prev.sceneData
                  : {};
              var incSD =
                typeof incoming.sceneData === "object" && incoming.sceneData
                  ? incoming.sceneData
                  : {};
              merged.sceneData = Object.assign({}, prevSD, incSD);

              var prevStatus =
                typeof prev.status === "string" ? prev.status : "";
              var incStatus =
                typeof incoming.status === "string" ? incoming.status : "";
              if (
                isTerminal(prevStatus) &&
                (incStatus === "incomplete" || incStatus === "completed")
              ) {
                merged.status = prevStatus;
              } else {
                merged.status = incStatus || prevStatus || "incomplete";
              }

              merged.version = 1;
              merged.lastUpdate = new Date().toISOString();
              if (typeof merged.timeSpent !== "number") {
                merged.timeSpent = Date.now();
              }

              var json = JSON.stringify(merged);

              if (json.length > 4096) {
                try {
                  if (
                    merged.sceneData &&
                    merged.sceneData.quizSummary &&
                    Array.isArray(merged.sceneData.quizSummary.details)
                  ) {
                    delete merged.sceneData.quizSummary.details;
                  }
                  if (
                    merged.sceneData &&
                    merged.sceneData.survey &&
                    typeof merged.sceneData.survey.feedback === "string" &&
                    merged.sceneData.survey.feedback.length > 300
                  ) {
                    merged.sceneData.survey.feedback =
                      merged.sceneData.survey.feedback.slice(0, 300);
                  }
                } catch (e) {}
                json = JSON.stringify(merged);
              }

              if (json.length > 4096) {
                var compact = {
                  version: 1,
                  lastScene: merged.lastScene,
                  completedScenes: merged.completedScenes,
                  totalScore: merged.totalScore,
                  status: merged.status,
                  lastUpdate: merged.lastUpdate,
                  timeSpent: merged.timeSpent,
                };
                json = JSON.stringify(compact);
                if (json.length > 4096) {
                  json = json.substring(0, 4096);
                }
              }

              scormSet("cmi.suspend_data", json);
              scormCommit();
            } catch {}
          }

          if (data.type === "scorm:interaction") {
            var p = data.payload || {};
            try {
              var idx =
                parseInt(scormGet("cmi.interactions._count") || "0", 10) || 0;
              var base = "cmi.interactions." + idx + ".";
              if (p.objectiveId)
                scormSet(base + "objectives.0.id", String(p.objectiveId));
              scormSet(base + "id", String(p.id || "int-" + (idx + 1)));
              scormSet(
                base + "type",
                mapInteractionType(String(p.type || "choice"))
              );
              if (p.correctPattern)
                scormSet(
                  base + "correct_responses.0.pattern",
                  String(p.correctPattern)
                );
              if (typeof p.response !== "undefined")
                scormSet(base + "student_response", String(p.response));
              scormSet(
                base + "result",
                mapInteractionResult(String(p.result || "neutral"))
              );
              scormSet(
                base + "time",
                formatTimeHHMMSS(new Date(p.time || Date.now()))
              );
              if (typeof p.weighting !== "undefined")
                scormSet(base + "weighting", String(p.weighting));
              if (typeof p.latencySeconds === "number") {
                var latH = Math.floor(p.latencySeconds / 3600);
                var latM = Math.floor((p.latencySeconds % 3600) / 60);
                var latS = Math.floor(p.latencySeconds % 60);
                scormSet(
                  base + "latency",
                  pad2(latH) + ":" + pad2(latM) + ":" + pad2(latS)
                );
              }
              scormCommit();
            } catch {}
          }

          if (data.type === "scorm:updateProgress") {
            var p = data.payload || {};

            if (typeof p.totalPoints === "number") {
              var scoreRaw = Math.max(
                0,
                Math.min(100, Math.round(p.totalPoints))
              );
              scormSet("cmi.core.score.raw", scoreRaw);
            }

            if (typeof p.sceneIndex === "number") {
              scormSet("cmi.core.lesson_location", String(p.sceneIndex));
            }

            var cur = scormGet("cmi.core.lesson_status") || "";
            var isTerminal = cur === "passed" || cur === "failed";
            if (
              p.status &&
              !(
                isTerminal &&
                (p.status === "incomplete" || p.status === "completed")
              )
            ) {
              scormSet("cmi.core.lesson_status", p.status);
            }
            scormCommit();
          }

          if (data.type === "scorm:finish") {
            scormSet("cmi.core.exit", "suspend");
            scormCommit();
            scormFinish();
          }
        });
        window.addEventListener("beforeunload", function () {
          scormCommit();
          scormFinish();
        });
        window.addEventListener("pagehide", function () {
          scormCommit();
          scormFinish();
        });
      })();
         </script>
   </body>
 </html>`;

  // SCORM 1.2 compliant imsmanifest.xml content
  const imsmanifestXML = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.example.microlearning" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.imsglobal.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="org1">
    <organization identifier="org1">
      <title>${courseTitle}</title>
      <item identifier="item1" identifierref="res1" isvisible="true">
        <title>${courseTitle} SCO</title>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;

  // Create ZIP file with both files
  createSCORMZipPackage(scormHTML, imsmanifestXML, courseTitle);
};

// Function to create ZIP package with HTML and XML files
const createSCORMZipPackage = async (htmlContent: string, xmlContent: string, courseTitle: string) => {
  try {
    const zip = new JSZip();

    // Add files to ZIP
    zip.file('index.html', htmlContent);
    zip.file('imsmanifest.xml', xmlContent);

    // Generate ZIP file
    const content = await zip.generateAsync({ type: 'blob' });

    // Create download link
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${courseTitle.replace(/\s+/g, '-').toLowerCase()}-scorm-package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error creating ZIP file:', error);
  }
};
