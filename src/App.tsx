import React, { useEffect, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { QuizComponent } from "./QuizComponent";
import { studyNotes } from "./studyNotes";

function initializeRefTagger(): void {
  document.getElementById("myRefTagger")?.remove();
  (window as any).refTagger = {
    settings: {
      bibleVersion: "ESV",
    },
  };

  (function (d, t) {
    var n = d.querySelector("[nonce]") as any;
    (window as any).refTagger.settings.nonce = n && (n.nonce || n.getAttribute("nonce"));
    var g = d.createElement(t) as any;
    g.id = "myRefTagger";
    g.src = "https://api.reftagger.com/v2/RefTagger.js";
    g.nonce = (window as any).refTagger.settings.nonce;
    document.body.append(g);
  })(document, "script");
}

function App() {
  useEffect(() => {
    initializeRefTagger.call(window);
  }, []); // Add dependencies here if the effect should run on specific updates
  const allNotesAsReferences = useMemo(() => {
    const notes = studyNotes.map((x) => x.references).flat();
    const uniqueNotes = new Set(notes);
    return Array.from(uniqueNotes);
  }, []);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const readyToLoad = document.getElementsByClassName("rtBibleRef").length > 0;
      if (readyToLoad) {
        setReady(true);
        clearInterval(interval);
      }
    }, 10);
  });
  return (
    <div>
      {ready && <QuizComponent data={studyNotes} />}
      <div style={{ visibility: "collapse" }}>
        {allNotesAsReferences.map((x) => (
          <span key={x} className="bibleRef" id={x}>
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;