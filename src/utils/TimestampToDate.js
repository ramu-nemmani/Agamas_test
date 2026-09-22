const TimestampToDate = (timestamp) => {
  try {
    if (!timestamp?.seconds) {
      return timestamp || "";
    }
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
    const date = new Date(milliseconds);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  } catch (error) {
    console.log("🚀 ~ TimestampToDate ~ error:", error);
  }
};

export default TimestampToDate;
