// README:
// modifySrt function will take an input.srt file, change specified subtitle times based on a new time provided as an argument.

// ARG 1: NEW START TIME
// First argument passed is the new start time for the subtitle. 
// This will modify all of the following subtitles based on the delta or offset between the time provided and the subtitle's current time in the input.srt file.
// e.g. 'node srtConverter.js 00:00:49,111' used on an input.srt whose subtitle at line number 1 is '00:01:19,111'
// will change all subtitle start and end times to be 30 seconds earlier (each subtitle remaining the same length).
// 2 Formats are available: 
  // passing in terms of milliseconds e.g. '00:00:41,700' 
  // or in terms of 24fps timecode (as displayed in Premiere Pro) e.g. '00:00:41:17'
// TODO - should make 30fps timecode an available format. This will require an additional argument to clarify which fps is being used.

// ARG 2: LINE NUMBER (OPTIONAL)
// Second argument passed is which line number to start modifying subtitle times at. 
// The line number here refers to the numbered line above a subtitle's start and end time in an .srt, for example:
    // 1
    // 00:01:19,111 --> 00:01:20,646
    // That's the cleanup crew

    // 2
    // 00:01:20,679 --> 00:01:22,647
    // up on the track,
    // and that's a lot of racers
// Not providing will assume a line number of 1, so the delta or offset will be calculated based on the difference between the new time provided in ARG 1 and
// the first subtitle's start time.
// Passing a line number will calculate the delta between the new time provided and the subtitle's start time at that line
// e.g. 'node srtConverter.js 00:00:49,111 2' based on the above example will leave line number 1 alone and return:
    // 1
    // 00:01:19,111 --> 00:01:20,646
    // That's the cleanup crew

    // 2
    // 00:00:49,111 --> 00:00:51,079
    // up on the track,
    // and that's a lot of racers

    // 3
    // 00:00:51,113 --> 00:00:53,882
    // involved there, folks.


const modifySrt = () => {
  const fs = require('fs');
  const inputPath = "input.srt";
  const outputPath = "output.srt";

  fs.readFile(inputPath, 'utf8' , (err, data) => {
    if (err) {
      return console.error(err);
    }
    const dataArr = data.split("\n");
    const offset = getOffsetAmount(dataArr);
    if (offset === 0 || isNaN(offset)) {
      return console.error('no difference from current time');
    }

    const newData = offsetData(dataArr,offset);

    fs.writeFile(outputPath, newData, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(outputPath + " was updated!");
    });
  });
}

const offsetData = (dataArr, offset) => {
  let array = [];
  let lineNumber = 1;
  const lineNumberToStartOffset = process.argv[3] || 1;
  let startOffset = false;
  dataArr.forEach(line => {
    let newLine = line;
    if (line.includes(" --> ") && startOffset) {
      newLine = getNewLineWithOffset(line, offset);
    }
    else if (isLineNumber(removeReturnFromLine(line))) {
        newLine = lineNumber + "\r";
        lineNumber++;
        if (lineNumber > lineNumberToStartOffset) {
          startOffset = true;
        }
      }
    array.push(newLine);
  });
  return array.join("\n");
}

const isLineNumber = (line) => {
  return !isNaN(Number(line)) && !isNaN(parseInt(line)) && line.indexOf(".") !== line.length - 1;
}

const getNewLineWithOffset = (line, offset) => {
  let lineWithReturnRemoved = removeReturnFromLine(line);
  const {startTimeString, endTimeString} = getStartAndEndString(lineWithReturnRemoved);
  const newStartTime = convertStringToMillisecs(startTimeString) + offset;
  const newEndTime = convertStringToMillisecs(endTimeString) + offset;
  const newStartString = convertMillisecsToString(newStartTime);
  const newEndString = convertMillisecsToString(newEndTime);
  return newStartString + " --> " + newEndString + "\r";
}

const getOffsetAmount = (dataArr) => {
  // new Initial time for the first line in the srt file 
  // e.g. 00:01:19,111 (milliseconds format)
  // the difference between the first line's time and the new inital time will be taken and used as an offset for all times
  // e.g. 00:01:49,111 - 00:01:19,111 would return an offset of -00:00:30,000 and all following times in srt would get modified by this amount.
  const newInitialString = process.argv[2];
  const lineNumberToStartOffset = process.argv[3] || 1;
  console.log('new time: ' + newInitialString);
  console.log('line number to start offset: ' + lineNumberToStartOffset);
  const firstLineToOffset = getFirstTimeLineToOffset(dataArr,lineNumberToStartOffset);
  const oldInitialString = getInitialTimeString(firstLineToOffset);
  const oldInitialTime = convertStringToMillisecs(oldInitialString);
  const newInitialTime = convertStringToMillisecs(newInitialString);
  console.log('newInitialTime',newInitialTime);
  console.log('offset',newInitialTime - oldInitialTime);
  
  return newInitialTime - oldInitialTime;
}

const removeReturnFromLine = (line) => {
  return line.substring(0,line.indexOf("\r"));
}

const getStartAndEndString = (lineString) => {
  const lineArr = lineString.split(" --> ");
  const startTimeString = lineArr[0];
  const endTimeString = lineArr[1]
  return {startTimeString, endTimeString};
}

const getFirstTimeLineToOffset = (dataArray,lineNumberToStartOffset) => {
  return dataArray.find((line, index, array) => {
    if (index === 0) {
      return false;
    }
    let prevLine = removeReturnFromLine(array[index - 1]);
    return isLineNumber(prevLine) && (Number(prevLine) >= lineNumberToStartOffset) && line.includes(" --> ");
  });
}

const getInitialTimeString = (firstLine) => {
  const oldInitialString = firstLine.split(" --> ").shift();
  console.log('old time at that line: ' + oldInitialString);
  return oldInitialString;
}

const convertMillisecsToString = (totalMilliSecs) => {
  let remainingMillisecs = totalMilliSecs;
  const hrs = Math.floor(remainingMillisecs/(60 * 60 * 1000));
  remainingMillisecs = remainingMillisecs - (hrs * 60 * 60 * 1000);
  const mins = Math.floor(remainingMillisecs/(60 * 1000));
  remainingMillisecs = remainingMillisecs - (mins * 60 * 1000);
  const secs = Math.floor(remainingMillisecs/(1000));
  remainingMillisecs = remainingMillisecs - (secs * 1000);
  const hrsString = formatHrMinSec(hrs);
  const minsString = formatHrMinSec(mins);
  const secsString = formatHrMinSec(secs);
  const millisecsString = formatMillisec(remainingMillisecs);
  const timeString =  hrsString + ":" + minsString + ":" + secsString + "," + millisecsString;
  return timeString;
}

const formatHrMinSec = (number) => {
  const string = number.toString();
  let newString = string;
  if (string.length < 2) {
    newString = "0" + newString;
  }
  return newString;
}

const formatMillisec = (number) => {
  const string = number.toString();
  let newString = string;
  if (string.length < 3) {
    if (string.length < 2) {
      newString = "0" + newString;
    }
    newString = "0" + newString;
  }
  return newString;
}

const convertStringToMillisecs = (timeString) => {
  const timeArr = timeString.split(":");
  if (!isValidTimeInMillisecs(timeArr)) {
    if (!isValidTimeInFps(timeArr)) {
      console.log("time format isn't valid");
      return;
    }
    return getMillisecsFromFps(timeArr);
  }
  return getMillisecs(timeArr);
}

const getMillisecs = (timeArr) => {
  const hrs = parseInt(timeArr[0]);
  const mins = parseInt(timeArr[1]);
  const secondArr = timeArr[2].split(",");
  const secs = parseInt(secondArr[0]);
  const millisecs = parseInt(secondArr[1]);
  const totalMilliSecs = hrs * 60 * 60 * 1000 + mins * 60 * 1000 + secs * 1000 + millisecs;
  return totalMilliSecs;
}

const getMillisecsFromFps = (timeArr) => {
  const fps = 24;
  const hrs = parseInt(timeArr[0]);
  const mins = parseInt(timeArr[1]);
  const secs = parseInt(timeArr[2]);
  const millisecs = Math.round(parseInt(timeArr[3]) * (1000 / fps));
  const totalMilliSecs = hrs * 60 * 60 * 1000 + mins * 60 * 1000 + secs * 1000 + millisecs;
  return totalMilliSecs;
}

const isValidTimeInMillisecs = (timeArr) => {
  if (timeArr.length !== 3 || !isValidHrMinSec(timeArr[0]) || !isValidHrMinSec(timeArr[1])) {
    return false;
  }
  const secondArr = timeArr[2].split(",");
  if (!isValidHrMinSec(secondArr[0])) {
    return false;
  }
  if(!isValidMilliSec(secondArr[1])) {
    return false;
  }
  return true;
}

const isValidTimeInFps = (timeArr) => {
  if (timeArr.length !== 4 || !isValidHrMinSec(timeArr[0]) || !isValidHrMinSec(timeArr[1]) || !isValidHrMinSec(timeArr[2])) {
    return false;
  }
  if(!isValidFps(timeArr[3])) {
    return false;
  }
  return true;
}

const isValidTime = (timeArr) => {
  return isValidTimeInMillisecs(timeArr) || isValidTimeInFps(timeArr);
}

const isValidHrMinSec = (string) => {
  return !isNaN(parseInt(string)) && string.length === 2;
}

const isValidMilliSec = (string) => {
  return !isNaN(parseInt(string)) && string.length === 3;
}

const isValidFps = (string) => {
  return !isNaN(parseInt(string)) && string.length === 2;
}

modifySrt();