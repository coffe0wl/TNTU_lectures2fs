export const delay = async (ms) => {
  return new Promise((res) => {
    setTimeout(res, ms);
  })
}