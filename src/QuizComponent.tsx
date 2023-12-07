import React, { useState, useEffect, useMemo } from "react";
import { StudyNote } from "./studyNotes";

export interface QuizComponentProps {
  data: StudyNote[];
}

type QuizQuestion = {
  selectedStudyNote: StudyNote;
  availableReferencesToGuess: string[];
};

export const QuizComponent: React.FC<QuizComponentProps> = ({ data }) => {
  const [notesInRandomOrder, setRandomNotesInOrder] = useState(() => {
    return data.sort(() => Math.random() - 0.5);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedText, setRevealedText] = useState<string>("");

  // Function to select a random topic
  const getRandomStudyNote = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  };

  const setNewQuestion = (index: number) => {
    setCurrentIndex(index);
    const currentStudyNote = notesInRandomOrder[index];

    const referenceSet = new Set<string>();
    currentStudyNote?.references.forEach((ref) => referenceSet.add(ref));

    let i = 0;
    while (referenceSet.size < 10) {
      i++;
      const randomTopic = getRandomStudyNote();
      randomTopic?.references.forEach((ref) => referenceSet.add(ref));
      if (i > 100) {
        break;
      }
    }

    setCurrentQuestion({
      selectedStudyNote: currentStudyNote,
      availableReferencesToGuess: Array.from(referenceSet).sort(() => Math.random() - 0.5),
    });
  };

  useEffect(() => {
    setNewQuestion(0);
  }, [data]);

  const handleReferenceSelect = (reference: string) => {
    if (selectedReferences.includes(reference)) {
      // Remove the reference from the selectedReferences array
      setSelectedReferences(selectedReferences.filter((ref) => ref !== reference));
    } else {
      setSelectedReferences([...selectedReferences, reference]);
    }
    // Add or remove the reference from the selectedReferences array
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (
      selectedReferences.filter((x) => currentQuestion?.selectedStudyNote.references.includes(x)).length !==
      currentQuestion?.selectedStudyNote.references.length
    ) {
      setRandomNotesInOrder([...notesInRandomOrder, notesInRandomOrder[currentIndex]]);
    }
    // Check answers and provide feedback
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedReferences([]);
    setNewQuestion((currentIndex + 1) % notesInRandomOrder.length);
    setRevealedText("");
    // Check answers and provide feedback
  };

  const handlePrevious = () => {
    setIsSubmitted(false);
    setSelectedReferences([]);
    setNewQuestion(currentIndex == 0 ? notesInRandomOrder.length - 1 : currentIndex - 1);
    setRevealedText("");
    // Check answers and provide feedback
  };

  const revealText = (ref: string, target: HTMLButtonElement) => {
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

    // target.append(bibleRef);
    // setAppendedRefs([...appendedRefs, ref]);
  };

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
      <div
        style={{
          padding: "4px",
          fontSize: "24px",
          minHeight: "10%",
          color: currentIndex > data.length ? "red" : "black",
        }}
        className="topic-section"
      >
        {currentQuestion?.selectedStudyNote.topic}
      </div>

      <div style={{ padding: 2, margin: 2, borderBottom: "10px solid black" }}>
        <button style={{ padding: 2, margin: 2 }} onClick={handleSubmit}>
          Submit
        </button>
        <button style={{ padding: 2, margin: 2 }} onClick={handleNext}>
          Next
        </button>
        <button style={{ padding: 2, margin: 2 }} onClick={handlePrevious}>
          Previous
        </button>
      </div>
      <div>
        <div
          className="references-section"
          style={{ display: "flex", flexDirection: "column", borderBottom: "10px solid black" }}
        >
          {currentQuestion?.availableReferencesToGuess.map((ref) => {
            const isACorrectAnswer = currentQuestion?.selectedStudyNote.references.includes(ref);
            const isSelectedAnswer = selectedReferences.includes(ref);
            let backgroundColor = "green";
            if (isSubmitted) {
              if (isACorrectAnswer) {
                backgroundColor = "green";
              } else {
                backgroundColor = "red";
              }
            } else {
              if (isSelectedAnswer) {
                backgroundColor = "gray";
              } else {
                backgroundColor = "white";
              }
            }
            return (
              <div style={{ flex: 1, display: "flex" }} key={ref}>
                <button
                  style={{
                    flex: 3,
                    margin: "4px",
                    padding: "4px",
                    backgroundColor: backgroundColor,
                    border: "2px solid black",
                  }}
                  onClick={() => handleReferenceSelect(ref)}
                >
                  {ref}
                </button>
                <button
                  style={{ flex: 1, margin: "4px", padding: "4px" }}
                  onClick={(e) => {
                    revealText(ref, e.currentTarget);
                  }}
                >
                  Reveal text
                </button>
              </div>
            );
          })}
        </div>
        <div dangerouslySetInnerHTML={{ __html: revealedText }}></div>
      </div>
    </div>
  );
};
