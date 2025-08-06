const FormatTime = (inputSeconds: number): string => {
    if (isNaN(inputSeconds) || inputSeconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(inputSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

    if (hours > 0) {
        return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${formattedMinutes}:${formattedSeconds}`;
};

export default FormatTime;
