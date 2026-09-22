import { useEffect, useState } from "react";

export default function CategoryView() {
  const [viewMode, setViewMode] = useState("chinese");
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    setViewMode("chinese");
    setTexts(initialTexts);
  }, []);

  const initialTexts = [
    {
      title: "長阿含經 - Dīrgha Āgama",
      volume: "Volume 1",
      chapter: "Chapter 1",
      translator: "Acharya Nagajiva",
      chinese:
        "如是我聞。一時佛在舍衛國祇樹給孤獨園。與大比丘眾千二百五十人俱。爾時世尊告諸比丘。有四念處。何等為四。謂身念處。受念處。心念處。法念處。",
      english:
        'Thus have I heard. At one time the Budha was staying in the Jetavana monastery in Śrāvastī, together with a great community of 1,250 monks. At that time the World-Honored One addressed the monks: "There are four foundations of mindfulness. What are the four? They are: mindfulness of the body, mindfulness of feelings, mindfulness of the mind, and mindfulness of phenomena."',
    },
    // Add remaining initial texts
  ];


  return (
    <div
      className={`bg-[#fff7f1] min-h-screen ${
        viewMode === "chinese"
          ? "view-mode-chinese"
          : viewMode === "english"
          ? "view-mode-english"
          : ""
      }`}
    >
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl font-semibold text-gray-800 mb-2">
          Chinese Texts
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Explore the original Chinese translations of the ancient Agama texts,
          preserved through centuries of Budhist tradition.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200 mb-10">
          <label className="block text-sm font-semibold text-gray-800 mb-4">
            View Options:
          </label>
          <div className="flex flex-wrap gap-3">
            {["chinese", "both", "english"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 border-2 rounded-md font-medium text-sm transition-all ${
                  viewMode === mode
                    ? "bg-[#cd5c3d] text-white border-[#cd5c3d]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#cd5c3d] hover:text-[#cd5c3d]"
                }`}
              >
                {mode === "chinese"
                  ? "Only Chinese"
                  : mode === "english"
                  ? "Only English"
                  : "Chinese + English"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {texts.map((text, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow transition-colors"
            >
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {text.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>{text.volume}</span>
                  <span>{text.chapter}</span>
                  <span>Translated by {text.translator}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="chinese-text leading-relaxed text-gray-800 text-base">
                  {text.chinese}
                </div>
                <div className="english-text border-l-4 border-[#cd5c3d] pl-5 italic text-gray-600 text-sm">
                  {text.english}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
