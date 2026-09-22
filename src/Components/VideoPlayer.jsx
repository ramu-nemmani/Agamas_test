import { useParams } from "react-router-dom";

const VideoPlayer = () => {
  const { id } = useParams();
  console.log("🚀 ~ VideoPlayer ~ id:", id);
  return (
    <div className="bg-black z-50 flex items-center justify-center h-screen">
      <div className="flex-1 flex items-center justify-center bg-black">
        <video
          className="w-full h-full object-contain"
          src={
            "https://firebasestorage.googleapis.com/v0/b/agamatranslationsfordrlim.firebasestorage.app/o/videos%2FThe%20Ekotara%20Agama%2F1760165827653_Screen%20Recording%202025-02-06%20145358.mp4?alt=media&token=ec120fa3-ae93-4bd3-aa24-24db0d0a3ed4"
          }
          controls
          autoPlay
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
