import React, { useState, useEffect } from "react";
import { StudyNote } from "./studyNotes";

export interface FindTopicForReferenceProps {
  data: StudyNote[];
}

type CurrentQuestion = {
  selectedTopic: string;
  selectedReference: string;
  availableTopicsToGuess: string[];
};

export const FindTopicForReference: React.FC<FindTopicForReferenceProps> = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedText, setRevealedText] = useState<string>("");

  const getRandomStudyNote = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  };

  const setNewQuestion = () => {
    const currentStudyNote = getRandomStudyNote();

    const topicSet = new Set<string>();
    topicSet.add(currentStudyNote?.topic);

    let i = 0;
    while (topicSet.size < 10) {
      i++;
      const randomTopic = getRandomStudyNote();
      topicSet.add(randomTopic?.topic);
      if (i > 30) {
        break;
      }
    }

    setCurrentQuestion({
      selectedReference: currentStudyNote.references.sort(() => Math.random() - 0.5)[0] || "",
      availableTopicsToGuess: Array.from(topicSet).sort(() => Math.random() - 0.5),
      selectedTopic: currentStudyNote.topic,
    });
  };

  useEffect(() => {
    setNewQuestion();
  }, [data]);

  const handleTopicSelect = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      // Remove the reference from the selectedReferences array
      setSelectedTopics(selectedTopics.filter((possibleTopic) => possibleTopic !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
    // Add or remove the reference from the selectedReferences array
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Check answers and provide feedback
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedTopics([]);
    setNewQuestion();
    setRevealedText("");
    // Check answers and provide feedback
  };

  const revealText = () => {
    try {
      const htmlCollection = document.getElementsByClassName("bibleRef");
      // filter the htmlCollection to only include the element with the id of ref
      const element = Array.from(htmlCollection).filter((x) => x.id === currentQuestion?.selectedReference)[0];
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
      <div style={{ padding: "4px", fontSize: "24px", minHeight: "10%" }} className="topic-section">
        {currentQuestion?.selectedReference}
        <button
          style={{ flex: 1, margin: "4px", padding: "4px" }}
          onClick={() => {
            revealText();
          }}
        >
          Reveal text
        </button>
      </div>
      <div style={{ padding: 2, margin: 2, borderBottom: "10px solid black" }}>
        <button style={{ padding: 2, margin: 2 }} onClick={handleSubmit}>
          Submit
        </button>
        <button style={{ padding: 2, margin: 2, visibility: isSubmitted ? "visible" : "hidden" }} onClick={handleNext}>
          Next
        </button>
      </div>
      <div>
        <div
          className="references-section"
          style={{ display: "flex", flexDirection: "column", borderBottom: "10px solid black" }}
        >
          {currentQuestion?.availableTopicsToGuess.map((topic) => {
            const isACorrectAnswer = currentQuestion?.selectedTopic === topic;
            const isSelectedAnswer = selectedTopics.includes(topic);
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
              <div style={{ flex: 1, display: "flex" }} key={topic}>
                <button
                  style={{
                    flex: 3,
                    margin: "4px",
                    padding: "4px",
                    backgroundColor: backgroundColor,
                    border: "2px solid black",
                  }}
                  onClick={() => handleTopicSelect(topic)}
                >
                  {topic}
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
