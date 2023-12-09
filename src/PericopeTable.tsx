import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { allPericopes } from "./allPericopes";
import { bookMap } from "./bookMap";
import { studyNotes } from "./studyNotes";

export const PericopeTable = () => {
  const [extraDataByReferenceRange, setExtraDataByReferenceRange] = useState<Record<string, string>>({});

  const loadExtraData = () => {
    // load extra data
    const extraDataByReferenceRangeString = window.localStorage.getItem("extraDataByReferenceRange");
    if (extraDataByReferenceRangeString) {
      setExtraDataByReferenceRange(JSON.parse(extraDataByReferenceRangeString));
    }
  };

  const saveExtraData = () => {
    window.localStorage.setItem("extraDataByReferenceRange", JSON.stringify(extraDataByReferenceRange));
  };

  const pericopesWithStartAndChapterAndVerses = useMemo(() => {
    const pericopesWithStartAndChapterAndVerses = allPericopes.map((pericope) => {
      const [book, referenceRange] = pericope.referenceRange.split(" ");
      let [startReference, endReference] = referenceRange.split("-");
      const [startChapter, startVerse] = startReference.split(":");
      let endingChapter = startChapter;
      let endingVerse: string = startVerse;

      if (endReference) {
        if (endReference.includes(":")) {
          [endingChapter, endingVerse] = endReference.split(":");
        } else {
          endingVerse = endReference;
        }
      }

      return {
        pericope: pericope.pericope,
        book,
        referenceId: pericope.referenceRange,
        startChapter: parseInt(startChapter),
        startVerse: parseInt(startVerse),
        endingChapter: parseInt(endingChapter),
        endingVerse: parseInt(endingVerse),
        topics: [] as { topic: string; reference: string }[],
      };
    });

    const theNotes = studyNotes.map((studyNote) => {
      return {
        topic: studyNote.topic,
        references: studyNote.references.map((reference) => {
          let book: string;
          let referenceRange: string;
          if (reference.startsWith("1 ") || reference.startsWith("2 ")) {
            const [bookNumber, bookName, range] = reference.split(" ");
            book = bookNumber + " " + bookName;
            referenceRange = range;
          } else {
            [book, referenceRange] = reference.split(" ");
          }
          let [startReference, endReference] = referenceRange.split("-");
          const [startChapter, startVerse] = startReference.split(":");
          let endingChapter = startChapter;
          let endingVerse: string = startVerse;

          if (endReference) {
            if (endReference.includes(":")) {
              [endingChapter, endingVerse] = endReference.split(":");
            } else {
              endingVerse = endReference;
            }
          }

          return {
            book: bookMap[book],
            referenceId: reference,
            startChapter: parseInt(startChapter),
            startVerse: parseInt(startVerse),
            endingChapter: parseInt(endingChapter),
            endingVerse: parseInt(endingVerse),
          };
        }),
      };
    });

    function intersects(
      entry: (typeof pericopesWithStartAndChapterAndVerses)[0],
      reference: (typeof theNotes)[0]["references"][0]
    ) {
      // Check if the chapter and verse ranges intersect
      let intersectsChapter =
        entry.startChapter <= reference.endingChapter && entry.endingChapter >= reference.startChapter;
      let intersectsVerse = entry.startVerse <= reference.endingVerse && entry.endingVerse >= reference.startVerse;

      return intersectsChapter && intersectsVerse;
    }

    pericopesWithStartAndChapterAndVerses.forEach((entry) => {
      theNotes.forEach((topicEntry) => {
        topicEntry.references.forEach((reference) => {
          if (entry.book === reference.book && intersects(entry, reference)) {
            if (!entry.topics.map((x) => x.topic).includes(topicEntry.topic)) {
              entry.topics.push({ topic: topicEntry.topic, reference: reference.referenceId });
            }
          }
        });
      });
    });

    // console.log(pericopesWithStartAndChapterAndVerses);
    return pericopesWithStartAndChapterAndVerses;
  }, []);

  const rowRefs = useRef<React.RefObject<HTMLTableRowElement>[]>(
    pericopesWithStartAndChapterAndVerses.map(() => createRef<HTMLTableRowElement>())
  );

  const [currentPericopeIndex, setCurrentPericopeIndex] = useState(0);

  const scrollToRow = (index: number) => {
    const rowRef = rowRefs.current[index];
    if (rowRef && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  };

  const [revealedText, setRevealedText] = useState("");

  const revealText = (ref: string) => {
    try {
      const htmlCollection = document.getElementsByClassName("bibleRef");
      // filter the htmlCollection to only include the element with the id of ref
      const element = Array.from(htmlCollection).filter((x) => x.id === ref)[0];
      const bibleRef = Array.from(element.children).find((x) => x.className == "rtBibleRef") as HTMLAnchorElement;
      bibleRef.click();
      window.setTimeout(() => {
        try {
          const textToReveal = (document.getElementsByClassName("resourcetext")[0] as HTMLDivElement).innerHTML;
          setRevealedText(textToReveal);
        } catch (error) {}
      }, 1000);
    } catch (error) {}
  };

  const scrollToTopicWithReference = (ref: string) => {
    const pericopeToScrollTo = pericopesWithStartAndChapterAndVerses.findIndex((x) =>
      x.topics.find((x) => x.reference === ref)
    );
    if (pericopeToScrollTo !== -1) {
      scrollToRow(pericopeToScrollTo);
    }
  };

  const allTopicsRandom = useMemo(() => {
    return [...studyNotes].sort(() => Math.random() - 0.5);
  }, []);

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [hasRevealedVerses, setHasRevealedVerses] = useState(false);

  return (
    <div>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, backgroundColor: "white", zIndex: 100 }}>
        <div style={{ display: "flex", flexDirection: "column", margin: "3px" }}>
          <div>{allTopicsRandom[currentTopicIndex]?.topic}</div>
          <div>
            {!hasRevealedVerses && <button onClick={() => setHasRevealedVerses(true)}>Reveal verses</button>}
            {hasRevealedVerses && (
              <ul>
                {allTopicsRandom[currentTopicIndex].references.map((reference) => (
                  <li key={reference}>
                    <button onClick={() => revealText(reference)}>{reference}</button>
                    <button style={{ marginLeft: "4px" }} onClick={() => scrollToTopicWithReference(reference)}>
                      Go 2 Ctx
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <button
              onClick={() => {
                setCurrentTopicIndex((currentTopicIndex + 1) % allTopicsRandom.length);
                setHasRevealedVerses(false);
                setRevealedText("");
              }}
            >
              Next topic
            </button>
            <button
              onClick={() => {
                setCurrentTopicIndex((currentTopicIndex - 1) % allTopicsRandom.length);
                setHasRevealedVerses(false);
                setRevealedText("");
              }}
            >
              Previous topic
            </button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "100px", maxHeight: "70vh", overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Pericope</th>
              <th>References</th>
            </tr>
          </thead>
          <tbody>
            {pericopesWithStartAndChapterAndVerses.map((pericope, pericopIndex) => (
              <tr key={pericope.referenceId} ref={rowRefs.current[pericopIndex]}>
                <td style={{ border: "1px solid black", borderTop: "none", wordWrap: "normal", maxWidth: "25%" }}>
                  {pericope.pericope}
                </td>
                <td style={{ borderBottom: "1px solid black", borderLeft: "none", borderRight: "1px solid black" }}>
                  <div>{pericope.referenceId}</div>

                  <ul style={{ margin: "16px", padding: "1px" }}>
                    {pericope.topics.map((topic, index) => (
                      <li key={`${topic.topic}${topic.reference}`}>
                        {topic.topic} <div style={{ margin: "2px" }}>{topic.reference}</div>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "white", zIndex: 100 }}>
        <div dangerouslySetInnerHTML={{ __html: revealedText }}></div>
      </div>
    </div>
  );
};
