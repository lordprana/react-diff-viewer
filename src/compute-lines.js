"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var diff = require("diff");
var jsDiff = diff;
var DiffType;
(function (DiffType) {
    DiffType[DiffType["DEFAULT"] = 0] = "DEFAULT";
    DiffType[DiffType["ADDED"] = 1] = "ADDED";
    DiffType[DiffType["REMOVED"] = 2] = "REMOVED";
})(DiffType = exports.DiffType || (exports.DiffType = {}));
// See https://github.com/kpdecker/jsdiff/tree/v4.0.1#api for more info on the below JsDiff methods
var DiffMethod;
(function (DiffMethod) {
    DiffMethod["CHARS"] = "diffChars";
    DiffMethod["WORDS"] = "diffWords";
    DiffMethod["WORDS_WITH_SPACE"] = "diffWordsWithSpace";
    DiffMethod["LINES"] = "diffLines";
    DiffMethod["TRIMMED_LINES"] = "diffTrimmedLines";
    DiffMethod["SENTENCES"] = "diffSentences";
    DiffMethod["CSS"] = "diffCss";
})(DiffMethod = exports.DiffMethod || (exports.DiffMethod = {}));
/**
 * Splits diff text by new line and computes final list of diff lines based on
 * conditions.
 *
 * @param value Diff text from the js diff module.
 */
var constructLines = function (value) {
    var lines = value.split('\n');
    var isAllEmpty = lines.every(function (val) { return !val; });
    if (isAllEmpty) {
        // This is to avoid added an extra new line in the UI.
        if (lines.length === 2) {
            return [];
        }
        lines.pop();
        return lines;
    }
    var lastLine = lines[lines.length - 1];
    var firstLine = lines[0];
    // Remove the first and last element if they are new line character. This is
    // to avoid addition of extra new line in the UI.
    if (!lastLine) {
        lines.pop();
    }
    if (!firstLine) {
        lines.shift();
    }
    return lines;
};
/**
 * Computes word diff information in the line.
 * [TODO]: Consider adding options argument for JsDiff text block comparison
 *
 * @param oldValue Old word in the line.
 * @param newValue New word in the line.
 * @param compareMethod JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
 */
var computeDiff = function (oldValue, newValue, compareMethod) {
    if (compareMethod === void 0) { compareMethod = DiffMethod.CHARS; }
    var diffArray = jsDiff[compareMethod](oldValue, newValue);
    var computedDiff = {
        left: [],
        right: [],
    };
    diffArray.forEach(function (_a) {
        var added = _a.added, removed = _a.removed, value = _a.value;
        var diffInformation = {};
        if (added) {
            diffInformation.type = DiffType.ADDED;
            diffInformation.value = value;
            computedDiff.right.push(diffInformation);
        }
        if (removed) {
            diffInformation.type = DiffType.REMOVED;
            diffInformation.value = value;
            computedDiff.left.push(diffInformation);
        }
        if (!removed && !added) {
            diffInformation.type = DiffType.DEFAULT;
            diffInformation.value = value;
            computedDiff.right.push(diffInformation);
            computedDiff.left.push(diffInformation);
        }
        return diffInformation;
    });
    return computedDiff;
};
/**
 * [TODO]: Think about moving common left and right value assignment to a
 * common place. Better readability?
 *
 * Computes line wise information based in the js diff information passed. Each
 * line contains information about left and right section. Left side denotes
 * deletion and right side denotes addition.
 *
 * @param oldString Old string to compare.
 * @param newString New string to compare with old string.
 * @param disableWordDiff Flag to enable/disable word diff.
 * @param compareMethod JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
 * @param linesOffset line number to start counting from
 */
var getArr = (value, options) => {
    let retLines = [],
      linesAndNewlines = value.split(/(\n|\r\n)/);

// Ignore the final empty token that occurs if the string ends with a new line
    if (!linesAndNewlines[linesAndNewlines.length - 1]) {
        linesAndNewlines.pop();
    }

// Merge the content and line separators into single tokens
    for (let i = 0; i < linesAndNewlines.length; i++) {
        let line = linesAndNewlines[i];

        if (i % 2 && !options.newlineIsToken) {
            retLines[retLines.length - 1] += line;
        } else {
            if (options.ignoreWhitespace) {
                line = line.trim();
            }
            retLines.push(line);
        }
    }

    return retLines;
}

var spliceArray = function (arr, num) {
    var len = arr.length
    var n = num
    var lineNum = len % n === 0 ? len / n : Math.floor((len / n) + 1);
    var result = []
    for (var i = 0; i < lineNum; i++) {
        var temp = arr.slice(i * n, i * n + n);
        result.push(temp);
    }
    return result
}

var computeLineInformation = function (oldString, newString, disableWordDiff, compareMethod, linesOffset) { if (disableWordDiff === void 0) { disableWordDiff = false; } if (compareMethod === void 0) { compareMethod = DiffMethod.CHARS; } if (linesOffset === void 0) { linesOffset = 0; } var diffArray = [] var type = 3 var num = 100 if (oldString.length > 1000 || newString.length > 1000) { type = 1 } if (type == 1) { var oldarr = getArr(oldString, { newlineIsToken: true, ignoreWhitespace: false, ignoreCase: false, }) var newarr = getArr(newString, { newlineIsToken: true, ignoreWhitespace: false, ignoreCase: false, }) var oa = oldarr.splice(0, num) var na = newarr.splice(0, num) while (oa.length > 0 || na.length > 0) { var o = oa.join('') var n = na.join('') diffArray = diffArray.concat(diff.diffLines(o, n, { newlineIsToken: true, ignoreWhitespace: false, ignoreCase: false, })); oa = oldarr.splice(0, num) na = newarr.splice(0, num) } } else if (type == 2) { var oldarr = oldString.split('\n') var newarr = newString.split('\n') var oa = oldarr.splice(0, num) var na = newarr.splice(0, num) while (oa.length > 0 || na.length > 0) { var o = '' var n = '' for (var i = 0; i < oa.length; i++) { o += '\n' + oa[i] } for (var i = 0; i < na.length; i++) { n += '\n' + na[i] } diffArray = diffArray.concat(diff.diffLines(o, n, { newlineIsToken: true, ignoreWhitespace: false, ignoreCase: false, })); oa = oldarr.splice(0, num) na = newarr.splice(0, num) } } else { diffArray = diffArray.concat(diff.diffLines(oldString, newString, { newlineIsToken: true, ignoreWhitespace: false, ignoreCase: false, })); } var rightLineNumber = linesOffset; var leftLineNumber = linesOffset; var lineInformation = []; var counter = 0; var diffLines = []; var ignoreDiffIndexes = []; var getLineInformation = function (value, diffIndex, added, removed, evaluateOnlyFirstLine) { var lines = constructLines(value); return lines .map(function (line, lineIndex) { var left = {}; var right = {}; if (ignoreDiffIndexes.includes(diffIndex + "-" + lineIndex) || (evaluateOnlyFirstLine && lineIndex !== 0)) { return undefined; } if (added || removed) { if (!diffLines.includes(counter)) { diffLines.push(counter); } if (removed) { leftLineNumber += 1; left.lineNumber = leftLineNumber; left.type = DiffType.REMOVED; left.value = line || ' '; // When the current line is of type REMOVED, check the next item in // the diff array whether it is of type ADDED. If true, the current // diff will be marked as both REMOVED and ADDED. Meaning, the // current line is a modification.
 var nextDiff = diffArray[diffIndex + 1]; if (nextDiff && nextDiff.added) { var nextDiffLines = constructLines(nextDiff.value)[lineIndex]; if (nextDiffLines) { var _a = getLineInformation(nextDiff.value, diffIndex, true, false, true)[0].right, rightValue = _a.value, lineNumber = _a.lineNumber, type = _a.type; // When identified as modification, push the next diff to ignore // list as the next value will be added in this line computation as // right and left values.
        ignoreDiffIndexes.push(diffIndex + 1 + "-" + lineIndex); right.lineNumber = lineNumber; right.type = type; // Do word level diff and assign the corresponding values to the // left and right diff information object.
        if (disableWordDiff) { right.value = rightValue; } else { var computedDiff = computeDiff(line, rightValue, compareMethod); right.value = computedDiff.right; left.value = computedDiff.left; } } } } else { rightLineNumber += 1; right.lineNumber = rightLineNumber; right.type = DiffType.ADDED; right.value = line; } } else { leftLineNumber += 1; rightLineNumber += 1; left.lineNumber = leftLineNumber; left.type = DiffType.DEFAULT; left.value = line; right.lineNumber = rightLineNumber; right.type = DiffType.DEFAULT; right.value = line; } counter += 1; return { right: right, left: left }; }) .filter(Boolean); }; diffArray.forEach(function (_a, index) { var added = _a.added, removed = _a.removed, value = _a.value; lineInformation = __spread(lineInformation, getLineInformation(value, index, added, removed)); }); return { lineInformation: lineInformation, diffLines: diffLines, }; };
exports.computeLineInformation = computeLineInformation;
