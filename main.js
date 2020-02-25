const fs = require('fs')


const readFiles = dirname => new Promise((resolve, reject) => fs.readdir(dirname, (err, filenames) => {
  if (err) {
    reject(err)
  } else {
    resolve(filenames)
  }
}))

const parseLine = line => line.split(/ /).map(s => parseInt(s, 10))

const readFile = path => {
  const lines = fs.readFileSync(path, 'utf8').split(/\n/)
  const fLine = parseLine(lines.shift())

  const bookScores = parseLine(lines.shift())

  const libraries = Array(lines.length / 2).fill(0).map((_, i) => {
    const l = parseLine(lines.shift())
    return {
      id: i,
      books: l[0],
      signupTime: l[1],
      bookPerDay: l[2],
      books: parseLine(lines.shift())
    }
  })

  return {
    books: fLine[0],
    libraries: fLine[1],
    dayForScanning: fLine[2],
    bookScores,
    libraries
  }
}




const main = async () => {
  const folder = 'data'
  const files = await readFiles(folder)

  // files.forEach(file => {
  //   readFile(folder + '/' + file)
  // })

  console.log(readFile(folder + '/' + files[2]))
  console.log(files)

}

main()
