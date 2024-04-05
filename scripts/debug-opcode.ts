import { take, uniq } from "lodash-es";
import opcodes from "../codes.json";
import joypads from "../joypads.json";

// console.log(uniq(opcodes));

function findLongestRepeatedSequence(arr) {
  let n = arr.length;
  let dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  let maxLength = 0;
  let endIndex = 0; // To track the end position of the longest sequence

  // Iterate through each element in the array
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      // Check if we have a repeating sequence and ensure it's not the same part of the array
      if (arr[i - 1] === arr[j - 1] && dp[i - 1][j - 1] < j - i) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i; // Update the end index of the sequence
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }

  // Extract the longest repeated sequence using the endIndex and maxLength
  let sequenceStart = endIndex - maxLength;
  let repeatedSequence = arr.slice(sequenceStart, sequenceStart + maxLength);

  return { maxLength, repeatedSequence };
}

function findShortestRepeatedSequence(arr) {
  let n = arr.length;
  let minLength = Infinity;
  let startIndex = -1; // To track the start position of the shortest sequence

  // We'll use a map to keep track of positions of seen sequences
  let seen = new Map();

  // Iterate through each element in the array
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let subArr = arr.slice(i, j + 1).toString();

      // If we've seen this sequence before, and it's repeating
      if (seen.has(subArr)) {
        let prevIndex = seen.get(subArr);
        // Ensure it's not overlapping with its previous occurrence
        if (prevIndex < i) {
          let currentLength = j - i + 1;
          if (currentLength < minLength) {
            minLength = currentLength;
            startIndex = i;
          }
        }
      } else {
        // First time seeing this sequence, store its last index
        seen.set(subArr, j);
      }

      // If we find a sequence of length 2, we can't find a shorter repeating sequence, so return
      if (minLength == 2) {
        return {
          minLength,
          repeatedSequence: arr.slice(startIndex, startIndex + minLength),
        };
      }
    }
  }

  // If we found a sequence, return it, otherwise return a message indicating no repeating sequence was found
  if (startIndex !== -1) {
    return {
      minLength,
      repeatedSequence: arr.slice(startIndex, startIndex + minLength),
    };
  } else {
    return "No repeating sequence found.";
  }
}

// console.log(
//   "Repeating opcode sequences:",
//   findLongestRepeatedSequence(take(opcodes, 10000))
// );
// console.log(
//   "Repeating opcode sequences:",
//   findShortestRepeatedSequence(take(opcodes, 10000))
// );
