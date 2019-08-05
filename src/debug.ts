const debug = debugPrint.bind(null, process.env.DEBUG === "interpreter");

function debugPrint(enabled = false, ...args: any[]) {
  if (enabled) console.log(...args);
}

export { debugPrint };
export default debug;
