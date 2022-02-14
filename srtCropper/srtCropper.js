const cropSrt = () => {
  const fs = require('fs');
  const inputPath = "inputCrop.srt";
  const outputPath = "outputCrop.srt";

  fs.readFile(inputPath, 'utf8' , (err, data) => {
    if (err) {
      return console.error(err);
    }
    const dataArr = data.split("\n");
    const newData = cropData(dataArr);

    fs.writeFile(outputPath, newData, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(outputPath + " was updated!");
    });
  });
}

const cropData = (dataArr) => {
  let array = [];
  let lineNumber = 1;
  const startLineNumber = process.argv[2];
  const endLineNumber = process.argv[3];
  // console.log('start line: ' + startLineNumber);
  // console.log('end line: ' + endLineNumber);

  let isCropping = false;
  let noMoreCropping = false;

  for (let i = 0; noMoreCropping === false; i++ ) {
    const line = dataArr[i];
    if (line === undefined) {
      isCropping = false;
      noMoreCropping = true;
    }
    else if (isLineNumber(removeReturnFromLine(line))) {
      lineNumber++;
      // console.log('line',line);
      // console.log('lineNumber',lineNumber);
      // console.log('startLineNumber',startLineNumber);
      // console.log('endLineNumber',endLineNumber);
      // console.log('lineNumber > startLineNumber',lineNumber > startLineNumber);
      // console.log('endLineNumber && lineNumber > endLineNumber',endLineNumber && lineNumber > endLineNumber);
      
      if (lineNumber > startLineNumber) {
        isCropping = true;
      }
      if ((endLineNumber && lineNumber > Number(endLineNumber) + 1)) {
        isCropping = false;
        noMoreCropping = true;
      }
    }
    if (isCropping) {
      array.push(line);
    }

  }
  return array.join("\n");
}

const isLineNumber = (line) => {
  return !isNaN(Number(line)) && !isNaN(parseInt(line)) && line.indexOf(".") !== line.length - 1;
}

const removeReturnFromLine = (line) => {
  return line.substring(0,line.indexOf("\r"));
}

cropSrt();