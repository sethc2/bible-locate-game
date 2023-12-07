import { useState } from "react";
import { allPericopes } from "./allPericopes";

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

  return (
    <div>
      <button onClick={() => saveExtraData()}>SaveExtraData</button>
      <button onClick={() => loadExtraData()}>LoadExtraData</button>
      <table>
        <thead>
          <tr>
            <th>Pericope</th>
            <th>References</th>
            <th>Extra data</th>
          </tr>
        </thead>
        <tbody>
          {allPericopes.map((pericope) => (
            <tr key={pericope.referenceRange}>
              <td>{pericope.pericope}</td>
              <td>{pericope.referenceRange}</td>
              <td>
                <textarea
                  value={extraDataByReferenceRange[pericope.referenceRange] || ""}
                  onChange={(e) => {
                    setExtraDataByReferenceRange({
                      ...extraDataByReferenceRange,
                      [pericope.referenceRange]: e.target.value,
                    });
                  }}
                ></textarea>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
