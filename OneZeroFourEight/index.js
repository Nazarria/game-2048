// UTILITIES

/// Merge two neighboring cells into one
function mergeTwoElements(x1, x2) {
  return x1 === x2 ? x1 * 2 : x1
}

/// Merge all the array element by element. It may free some cells
/// Returns [mergedArray, points, origins, merges]
///   origins[i] = source index in the original array for result position i (-1 if empty)
///   merges[i]  = true if result position i was produced by a merge
function mergeArray(xs) {
  const filtered = xs.filter(n => n != 0)
  const sourceIndices = []
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] !== 0) sourceIndices.push(i)
  }

  const result = []
  const origins = []
  const merges = []
  let points = 0

  for (let i = 0; i < filtered.length; i++) {
    const left = filtered[i]
    const right = filtered[i + 1]

    if (right !== undefined && left === right) {
      result.push(left * 2)
      origins.push(sourceIndices[i])
      merges.push(true)
      points += left * 2
      i++
    } else {
      result.push(left)
      origins.push(sourceIndices[i])
      merges.push(false)
    }
  }

  const padded = [...result, ...[0, 0, 0, 0]].slice(0, xs.length)
  while (origins.length < xs.length) { origins.push(-1); merges.push(false) }

  return [padded, points, origins, merges]
}

/// Merge all the matrix
function mergeMatrix(xss) {
  const result = []
  let points = 0
  const allOrigins = []
  const allMerges = []
  for (const row of xss) {
    const [r, p, origins, merges] = mergeArray(row)
    points += p
    result.push(r)
    allOrigins.push(origins)
    allMerges.push(merges)
  }
  return [result, points, allOrigins, allMerges]
}

function createMoveInfo(n) {
  return Array.from({length: n}, () => Array.from({length: n}, () => null))
}

function copyMatrix(matrix) {
  const n = matrix.length
  const copiedMatrix = []

  for (let i = 0; i < n; i++) {
    copiedMatrix.push([...matrix[i]])
  }

  return copiedMatrix
}
/// Performs rotation on the right
function rotateMatrixRight(matrix) {
  const result = copyMatrix(matrix)
  const n = matrix.length

  // Transpose the matrix
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Swap matrix[i][j] with matrix[j][i]
      const temp = result[i][j]
      result[i][j] = result[j][i]
      result[j][i] = temp
    }
  }

  // Reverse each row
  for (let i = 0; i < n; i++) {
    result[i] = result[i].toReversed()
  }

  return result
}

/// Generate a random integer value
function getRandomInt(min, max) {
  const min1 = Math.ceil(min)
  const max1 = Math.floor(max)
  return Math.floor(Math.random() * (max1 - min1 + 1)) + min1
}

/// Find coordinates using Cell Number
function findCoordinates(matrixSize, number) {
  const n = Math.sqrt(matrixSize)
  const row = Math.floor(number / n)
  const column = number % n
  return [row, column]
}

/// Return empty coordinates
function emptyCoordinates(xss) {
  const result = []
  for (let i = 0; i < xss.length; i++) {
    for (let j = 0; j < xss.length; j++) {
      if (xss[i][j] === 0) {
        result.push([i, j])
      }
    }
  }
  return result
}

// PUBLIC API

/// Compare matrixes

const API = {
  /// Key Handler — tiles slide upward
  up: xss => {
    const n = xss.length
    const r = rotateMatrixRight(rotateMatrixRight(rotateMatrixRight(xss)))
    const [rs, pt, origins, merges] = mergeMatrix(r)
    const moveInfo = createMoveInfo(n)
    for (let rr = 0; rr < n; rr++) {
      for (let rc = 0; rc < n; rc++) {
        if (origins[rr][rc] >= 0) {
          const destRow = rc, destCol = n - 1 - rr
          moveInfo[destRow][destCol] = { dx: 0, dy: origins[rr][rc] - rc, merged: merges[rr][rc] }
        }
      }
    }
    return [rotateMatrixRight(rs), pt, moveInfo]
  },

  /// Key Handler — tiles slide downward
  down: xss => {
    const n = xss.length
    const r = rotateMatrixRight(xss)
    const [rs, pt, origins, merges] = mergeMatrix(r)
    const moveInfo = createMoveInfo(n)
    for (let rr = 0; rr < n; rr++) {
      for (let rc = 0; rc < n; rc++) {
        if (origins[rr][rc] >= 0) {
          const destRow = n - 1 - rc, destCol = rr
          moveInfo[destRow][destCol] = { dx: 0, dy: rc - origins[rr][rc], merged: merges[rr][rc] }
        }
      }
    }
    return [rotateMatrixRight(rotateMatrixRight(rotateMatrixRight(rs))), pt, moveInfo]
  },

  /// Key Handler — tiles slide left
  left: xss => {
    const n = xss.length
    const [rs, pt, origins, merges] = mergeMatrix(xss)
    const moveInfo = createMoveInfo(n)
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (origins[r][c] >= 0) {
          moveInfo[r][c] = { dx: origins[r][c] - c, dy: 0, merged: merges[r][c] }
        }
      }
    }
    return [rs, pt, moveInfo]
  },

  /// Key Handler — tiles slide right
  right: xss => {
    const n = xss.length
    const r = rotateMatrixRight(rotateMatrixRight(xss))
    const [rs, pt, origins, merges] = mergeMatrix(r)
    const moveInfo = createMoveInfo(n)
    for (let rr = 0; rr < n; rr++) {
      for (let rc = 0; rc < n; rc++) {
        if (origins[rr][rc] >= 0) {
          const destRow = n - 1 - rr, destCol = n - 1 - rc
          moveInfo[destRow][destCol] = { dx: rc - origins[rr][rc], dy: 0, merged: merges[rr][rc] }
        }
      }
    }
    return [rotateMatrixRight(rotateMatrixRight(rs)), pt, moveInfo]
  },

  /// Game Initialization
  init: n => {
    const rand = () => getRandomInt(0, n * n - 1)
    let x = [rand(), rand()]
    while (x[0] === x[1]) {
      x = [rand(), rand()]
    }
    const result = []

    for (let i = 0; i < n; i++) {
      result[i] = []
      for (let j = 0; j < n; j++) {
        result[i][j] = 0
      }
    }

    const a = findCoordinates(n * n, x[0])
    const b = findCoordinates(n * n, x[1])

    result[a[0]][a[1]] = 2
    result[b[0]][b[1]] = 2

    return result
  },

  /// Add Random new Cells
  addRandom: xss => {
    const copy = copyMatrix(xss)
    const emptyCells = emptyCoordinates(copy)

    if (emptyCells.length === 0) {
      return undefined
    } else {
      const randomIndex = getRandomInt(0, emptyCells.length - 1)
      const [x, y] = emptyCells[randomIndex]
      copy[x][y] = 2
      return copy
    }
  },

  sameMatrixes: (xss, yss) => {
    for (let i = 0; i < xss.length; i++) {
      for (let j = 0; j < xss[0].length; j++) {
        if (xss[i][j] !== yss[i][j]) {
          return false
        }
      }
    }
    return true
  },
}
