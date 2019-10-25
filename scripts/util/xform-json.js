'use stirct'

const fs = require('fs').promises
const prettier = require('prettier')

module.exports = async (source, destination, instructions) => {
  if (instructions == null) {
    destination = source
    instructions = destination
  }

  const pkg = JSON.parse(await fs.readFile(source))

  for (const k in instructions) {
    const instr = instructions[k]

    if (k === 'remove') {
      for (const d of instr) {
        delete pkg[d]
      }
    } else {
      if (typeof instr === 'function') {
        pkg[k] = instr(pkg[k])
      } else {
        pkg[k] = instr
      }
    }
  }

  await fs.writeFile(
    destination,
    prettier.format(JSON.stringify(pkg), { parser: 'json' }),
    {
      mode: 0o644,
    }
  )
}
